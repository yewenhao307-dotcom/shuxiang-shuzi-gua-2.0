from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote, urlsplit
import socket
import threading
import webbrowser


ROOT = Path(__file__).resolve().parent


def find_port(start=8787, attempts=30):
    for port in range(start, start + attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
            try:
                probe.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    raise RuntimeError("找不到可用端口。")


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        path = unquote(urlsplit(self.path).path)
        requested_file = ROOT / path.lstrip("/")
        looks_like_page_route = "." not in Path(path).name

        # Browser history or mistyped wildcard routes such as /** should still
        # open this single-page site. Existing assets keep their normal paths.
        if path != "/" and looks_like_page_route and not requested_file.exists():
            self.path = "/index.html"

        super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    port = find_port()
    url = f"http://127.0.0.1:{port}/"
    print(f"天地衍数已启动：{url}")
    print("关闭此窗口即可停止网站。")
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    ThreadingHTTPServer(("127.0.0.1", port), AppHandler).serve_forever()
