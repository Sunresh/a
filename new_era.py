# main.py

import customtkinter as ctk
import module
import inspect

class MyApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("CustomTkinter Dynamic Function Buttons")
        self.geometry("400x400")

        # Get all functions from module
        self.functions = self.get_module_functions()

        # Create buttons dynamically
        for func_name, func in self.functions.items():
            button = ctk.CTkButton(self, text=f"Run {func_name}", command=lambda f=func: self.run_function(f))
            button.pack(pady=10)

    def get_module_functions(self):
        return {name: func for name, func in inspect.getmembers(module, inspect.isfunction) if not name.endswith("_helper")}
        #return {name: func for name, func in inspect.getmembers(module, inspect.isfunction)}

    def run_function(self, func):
        func()

if __name__ == "__main__":
    app = MyApp()
    app.mainloop()