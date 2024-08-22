class HtmlBuilder:
    def __init__(self, title="Untitled", output_file="output.html"):
        self.title = title
        self.output_file = output_file
        self.elements = []

    def add_element(self, tag, content="", attributes=None):
        self.elements.append({
            'tag': tag,
            'content': content,
            'attributes': attributes or {}
        })

    def build_html(self):
        html_content = f"<!DOCTYPE html>\n<html lang='en'>\n<head>\n\t<meta charset='UTF-8'>\n\t<title>{self.title}</title>\n</head>\n<body>\n"

        for element in self.elements:
            attrs = " ".join([f'{k}="{v}"' for k, v in element['attributes'].items()])
            html_content += f"\t<{element['tag']} {attrs}>{element['content']}</{element['tag']}>\n"

        html_content += "</body>\n</html>"
        return html_content

    def save_html(self):
        html_content = self.build_html()
        with open(self.output_file, 'w', encoding='utf-8') as file:
            file.write(html_content)
        print(f"HTML file saved as {self.output_file}")


# Example usage:
app = HtmlBuilder("My Webpage", "index.html")
app.add_element("h1", "Welcome to My Webpage")
app.add_element("p", "This is a paragraph.", {"class": "intro"})
app.add_element("a", "Click here", {"href": "https://example.com", "target": "_blank"})
app.save_html()