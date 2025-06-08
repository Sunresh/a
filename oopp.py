import cv2
import numpy as np

img_path = r"C:\Users\nares\Pictures\2018Mansarobar.jpg"

# Read an image from file
image = cv2.imread(img_path)

# Convert the image to grayscale
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Apply edge detection, for example using Canny
edges = cv2.Canny(gray, 50, 150)

# Find conto urs in the edged image
contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Draw contours on the original image
contour_image = image.copy()
cv2.drawContours(contour_image, contours, -1, (0, 255, 0), 2)  # -1 means draw all contours

cv2.namedWindow('Image with Contours', cv2.WINDOW_NORMAL)
cv2.resizeWindow('Image with Contours', contour_image.shape[1], contour_image.shape[0])

# Display the image with contours
cv2.imshow('Image with Contours', contour_image)
cv2.waitKey(0)

cv2.destroyAllWindows()
