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
elem = WebDriverWait(driver, 10).until(
           EC.visibility_of_element_located((By.NAME, "enter")))
elem.click()
elem = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.TAG_NAME, "h1")))
assert "גיזה גולדפארב" in driver.page_source
driver.close()
print("PASSED")
