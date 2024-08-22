import customtkinter as ctk
import module
import inspect

class MyApp:
    def __init__(self):

        self.root = ctk.CTk()
        self.root.title("CustomTkinter Dynamic Function Buttons")
        self.root.geometry("400x400")

        # Get all functions from module
        self.functions = self.get_module_functions()

        # Create buttons dynamically
        for func_name, func in self.functions.items():
            button = ctk.CTkButton(self.root, text=f"Run {func_name}", command=lambda f=func, r=self.root: self.run_function(f, r))
            button.pack(pady=10)

    def get_module_functions(self):
        return {name: func for name, func in inspect.getmembers(module, inspect.isfunction) if not name.endswith("_helper")}

    def run_function(self, func, root):
        func(root)
        # You can use 'root' here to add a popup or any other interaction

if __name__ == "__main__":
    app = MyApp()
    app.root.mainloop()
