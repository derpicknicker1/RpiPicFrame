from telegram.ext import Updater
import os
from time import time 
import signal
import json
from os import path
import sys


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

updater = Updater(token=settings['bot']['token'], use_context=True)
dispatcher = updater.dispatcher

import logging
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)

def start(update, context):
	context.bot.send_message(chat_id=update.effective_chat.id, text="I'm a bot, please talk to me!")
from telegram.ext import CommandHandler
start_handler = CommandHandler('start', start)
dispatcher.add_handler(start_handler)

def stop(update, context):
    context.bot.send_message(chat_id=update.effective_chat.id, text='Good bye!')
    os.kill(os.getpid(), signal.SIGINT)

stop_handler = CommandHandler('stop', stop)
dispatcher.add_handler(stop_handler)

def image_handler(bot, update):
	try:
		file_id = bot.message.photo[-1].file_id
		newFile = update.bot.getFile(file_id)
		message = bot.message.caption
		if not message:
			message = ""
		print ("file_id: " + str(file_id) + "\n"+message)
		file_name = str(int(time()*1000)) + '.jpg'
		newFile.download(settings['image_dir'] + file_name)
		writeMeta( file_name, message, str(int(time())) )
		update.bot.sendMessage(chat_id=bot.message.chat_id, text="download succesfull")
	except Exception as e:
		print(e)
		update.bot.sendMessage(chat_id=bot.message.chat_id, text="download error")

from telegram.ext import MessageHandler, Filters
dispatcher.add_handler(MessageHandler(Filters.photo, image_handler))

def writeMeta(file_name, message, time):
	if not path.exists(settings['image_dir'] + settings['meta_file']):
		with open(settings['image_dir'] + settings['meta_file'], "w+") as file:
			data = {file_name : {"text":message,"fav":False,"time":time,"sender":""}}
			json.dump(data, file, sort_keys=True, indent=4)
	else:
		with open(settings['image_dir'] + settings['meta_file'], "r+") as file:
		    data = json.load(file)
		    data.update({file_name : {"text":message,"fav":False,"time":time,"sender":""}})
		    file.seek(0)
		    json.dump(data, file, sort_keys=True, indent=4)

updater.start_polling()
updater.idle()
