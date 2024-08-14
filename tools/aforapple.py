from PIL import Image, ImageDraw, ImageFont
import os


def create_text_frame(text, size=(300, 300), bg_color="white", text_color="black"):
    image = Image.new("RGB", size, bg_color)
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype("arial.ttf", 36)
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_position = ((size[0] - text_bbox[2]) // 2, (size[1] - text_bbox[3]) // 2)
    draw.text(text_position, text, font=font, fill=text_color)
    return image


def create_text_animation(texts, output_filename, duration=500):
    frames = []
    for text in texts:
        frames.append(create_text_frame(text))

    frames[0].save(
        output_filename,
        save_all=True,
        append_images=frames[1:],
        duration=duration,
        loop=0
    )


# Example usage
texts = [
    "Hello",
    "World",
    "This",
    "Is",
    "An",
    "Animated",
    "GIF"
]

create_text_animation(texts, "animated_text.gif")