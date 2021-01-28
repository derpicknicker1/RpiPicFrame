from bottle import route, run, template, Bottle, static_file
from os import listdir
from os.path import isfile, join
from os import path
import bottle
import json
import re

settings = {}

try:
	if path.exists("settings.json"):
		with open("settings.json", "r+") as file:
			settings = json.load(file)
	else:
		raise SystemExit
except:
	print("Exception in opening settings.json!\nShutdown...")
	quit()

app = Bottle()

@app.route('/')
def index():
	return static_file("index.html", root="")

@app.route('/<dir>/<filename>')
def server_css(dir, filename):
	return static_file(filename, root=dir)

@app.route('/settings')
def server_settings():
	return static_file("settings.json", root='')

@app.route('/data')
def server_data():
	with open(settings['image_dir'] + settings['meta_file']) as json_file:
		data = json.load(json_file)
	files = [f for f in listdir(settings['image_dir']) if isfile(join(settings['image_dir'], f)) and re.match(r'[0-9]+.*\.jpg', f)]
	files.sort(reverse=True)
	files = files[:10]
	files.sort()
	ret_data = {};
	for f in files:
		if f in data:
			ret_data[f] = data[f];

	return ret_data

app.run(host=settings['server']['host'], port=settings['server']['port'], reloader=settings['server']['reloader'], debug=settings['server']['debug'])