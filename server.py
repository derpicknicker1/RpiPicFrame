from bottle import route, run, template, Bottle
from os import listdir
from os.path import isfile, join
import bottle

img_dir = "./img/"
app = Bottle()

@app.route('/hello/<name>')
def index(name):
	files = [f for f in listdir(img_dir) if isfile(join(img_dir, f))]
	images = [];
	for f in files:
		if f.endswith('.png'):
			images.append(f)

	return template('<b>Hello {{name}}</b>!<br><br>{{files}}', name=name, files = images)
bottle.debug(True)
app.run(host='localhost', port=80,reloader=True)