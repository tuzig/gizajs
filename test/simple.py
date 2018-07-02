import sys
from threading import Thread
from http.server import HTTPServer, SimpleHTTPRequestHandler

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

httpd = None

PORT = 8765


def run_server(httpd):
    sa = httpd.socket.getsockname()
    serve_message = "Serving HTTP on {host} port {port} (http://{host}:{port}/) ..."
    print(serve_message.format(host=sa[0], port=sa[1]))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nKeyboard interrupt received, exiting.")
        sys.exit(0)


if __name__ == '__main__':
    # server setup
    httpd = HTTPServer(("", PORT), SimpleHTTPRequestHandler)
    Thread(target=run_server, args=(httpd, )).start()

    # the tests
    driver = webdriver.Firefox()
    driver.get(f"http://127.0.0.1:{PORT}")
    assert "טוזיג" in driver.title
    elem = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.NAME, "enter")))
    elem.click()
    elem = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.TAG_NAME, "h1")))
    assert "גיזה גולדפארב" in driver.page_source
    driver.close()
    httpd.shutdown()
    print("PASSED")
