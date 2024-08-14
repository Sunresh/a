import customtkinter

class BaseUI:
    def __init__(self):
        customtkinter.set_appearance_mode("Light")  # Modes: "System" (standard), "Dark", "Light"
        customtkinter.set_default_color_theme("blue")  # Themes: "blue" (standard), "green", "dark-blue"
        # Create the main window
        app = customtkinter.CTk()
        app.geometry("800x640")
        app.title("3D Model Generator")
        frame1 = customtkinter.CTkFrame(master=app, width=280, height=280)
        frame1.pack(side="left", padx=10, pady=10, expand=True, fill="both")
        # Add a label to Frame 1
        label1 = customtkinter.CTkLabel(master=frame1, text="Actions")
        label1.pack(pady=20)
        # Create Frame 2
        frame2 = customtkinter.CTkFrame(master=app, width=280, height=280)
        frame2.pack(side="left", padx=10, pady=10, expand=True, fill="both")
        # Add a label to Frame 2
        label2 = customtkinter.CTkLabel(master=frame2, text="Settings")
        label2.pack(pady=20)

        app.mainloop()
