import cv2
from PIL import Image, ImageTk
import threading
import customtkinter

customtkinter.set_appearance_mode("Light")
customtkinter.set_default_color_theme("blue")

class Capture:
    def __init__(self, label):
        self.cap = None
        self.running = False
        self.label = label
        self.frame_size = (400, 400)  # Set the desired frame size

    def start_camera(self):
        if not self.running:
            self.cap = cv2.VideoCapture(0)
            self.running = True
            threading.Thread(target=self.update_frame, daemon=True).start()

    def stop_camera(self):
        if self.running:
            self.running = False
            if self.cap is not None:
                self.cap.release()
            cv2.destroyAllWindows()
            self.label.configure(image=None)  # Clear the label by setting image to None

    def update_frame(self):
        while self.running and self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                break

            # Convert the frame to RGB
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = cv2.flip(frame,1,frame)
            # Resize the frame to 400x400
            frame = cv2.resize(frame, self.frame_size)

            img = Image.fromarray(frame)

            # Convert the PIL image to a format usable by CTkImage
            ctk_img = customtkinter.CTkImage(light_image=img, size=self.frame_size)

            # Update the label with the new image
            self.label.configure(image=ctk_img)
            self.label.image = ctk_img  # Keep a reference to prevent garbage collection

# Create the main window
app = customtkinter.CTk()
app.geometry("800x640")
app.title("3D Model Generator")

# Create Frame 1 for controls
frame1 = customtkinter.CTkFrame(master=app, width=80, height=80)
frame1.pack(side="left", padx=10, pady=10, expand=True, fill="both")

# Create Frame 2 for the video feed
frame2 = customtkinter.CTkFrame(master=app, width=400, height=400)
frame2.pack(side="left", padx=10, pady=10, expand=True, fill="both")

# Add a label to Frame 2 to display the video
video_label = customtkinter.CTkLabel(master=frame2, width=400, height=400, text="")
video_label.pack(pady=20)

# Initialize the Capture class
capture = Capture(video_label)

# Add buttons to control the camera
start_button = customtkinter.CTkButton(master=frame1, text="Start Camera", command=capture.start_camera)
start_button.pack(pady=10)

stop_button = customtkinter.CTkButton(master=frame1, text="Stop Camera", command=capture.stop_camera)
stop_button.pack(pady=10)

# Start the main loop
app.mainloop()