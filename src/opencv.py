import cv2


class Capture:
    def __init__(self):
        self.cap = cv2.VideoCapture(0)

    def __del__(self):
        self.cap.release()
        cv2.destroyAllWindows()

    def frame_(self):
        # Check if the webcam is opened correctly
        if not self.cap.isOpened():
            print("Error: Could not open webcam.")
            return None

        # Capture frame-by-frame
        ret, frame = self.cap.read()

        # If frame is read correctly ret is True
        if not ret:
            print("Error: Failed to capture image.")
            return None

        return frame


# Example of how another class or function might use the Capture class
class FrameProcessor:
    def __init__(self):
        self.capture = Capture()

    def process(self):
        while True:
            frame = self.capture.frame_()
            if frame is None:
                break

            # Process the frame here (e.g., apply filters, detection, etc.)
            # For demonstration, we'll just display it
            cv2.imshow('Processed Frame', frame)

            # Press 'q' to quit the video stream
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cv2.destroyAllWindows()


# Run the processing
if __name__ == "__main__":
    processor = FrameProcessor()
    processor.process()
