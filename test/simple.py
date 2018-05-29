import sys

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Firefox()
## my shit
driver.get("http://127.0.0.1:8000")
assert "גיזה" in driver.title
try:
        element = WebDriverWait(driver, 10).until(
                    EC.visibility_of_element_located((By.NAME, "enter"))
                )
finally:
        if not element:
            print("'enter' elment didn't show up after 10 seconds");
            sys.exit(1)
elem = driver.find_element_by_name("enter")
elem.click()
elem = driver.find_element_by_tag_name("h1")
assert "גיזה גולדפארב" in driver.page_source
driver.close()
print("PASSED")
