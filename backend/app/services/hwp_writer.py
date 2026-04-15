import sys
import os
import pyhwpx

class HwpWriter:
    def __init__(self, visible = True):
        devnull = open(os.devnull, 'w', encoding='utf-8')
        old_stdout = sys.stdout
        sys.stdout = devnull
        try:
            self.hwp = pyhwpx.Hwp(new = True, visible = False)
        finally:
            sys.stdout = old_stdout
            devnull.close()

    def process_from_file(self, input_file, output_file):
        with open(input_file, 'r', encoding='utf-8') as f:
            return f.read()

    def parse_equation(self, text):
        parts = []
        segments = text.split("$")

        for i, segment in enumerate(segments):
            if segment:
                if i % 2 == 0:
                    parts.append(("txt", segment))
                else:
                    parts.append(("eq", segment))

        return parts
    
    def insert_equation(self, eq_text):
        pset = self.hwp.HParameterSet.HEqEdit
        self.hwp.HAction.GetDefault("EquationCreate", pset.HSet)
        pset.string = eq_text
        pset.BaseUnit = self.hwp.PointToHwpUnit(10.0)
        pset.EqFontName = "HYhwpEQ"
        self.hwp.HAction.Execute("EquationCreate", pset.HSet)

    def write_line(self, line):
        if not line.strip():
            self.hwp.HAction.Run("BreakPara")
            return
        
        parts = self.parse_equation(line)

        for part_type, content in parts:
            if part_type == "txt":
                self.hwp.insert_text(content)
            elif part_type == "eq":
                self.insert_equation(content)

        self.hwp.HAction.Run("BreakPara")  

    def write_hwp(self, input_file, output_file, on_progress = None):
        text = self.process_from_file(input_file, output_file)
        lines = text.split("\n")
        total_lines = len(lines)

        for i, line in enumerate(lines):
            self.write_line(line)
            
            if on_progress:
                on_progress(i + 1, total_lines)
        
        if output_file:
            self.hwp.SaveAs(output_file)
            self.hwp.Quit()