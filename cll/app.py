"""
If this code were to be used in a live app it would have to
be refactored to separate the routing from the logic.
"""

import flask
from flask import request
from flask import json
import csv
import tempfile
from os.path import basename
from services import lemmatizer


app = flask.Flask(__name__)
app.config.from_json('app.cfg')
print(app.config['APP_OS_PATH'])

languages = {
    'greek': "Greek",
    'latin': "Latin"
}


@app.route('/', methods=['GET'])
def index_get():
    """Renders lemmatizer without parameters
    """
    return flask.render_template(
        'index.html', languages=languages,
        current_language=app.config['DEFAULT_LANGUAGE'])


@app.route('/', methods=['POST'])
def index_post():
    """Lemmatizer POST handler. text_data is expected to be plain text but
    lemmatizer will be expected to handle text/xml content as well in
    at least greek and latin.
    """
    text_data = request.form['text_data']
    language = request.form['language']

    # Limit the input to max 1000 chars 
    if text_data.strip() == "" or len(text_data) > 1000:
        return flask.render_template('index.html', languages=languages)

    # Construct the query as a dictionary for compatability with JSON
    text_qry = {'Content-Type': "text/plain",
                'Content-Language': language,
                'Payload': text_data}
    lemma = lemmatizer.tokenize(text_qry)

    # Construct of JSON file for optional download
    filename = None
    with tempfile.NamedTemporaryFile(mode='w',
                                     dir=app.config['APP_DOWNLOAD_PATH'],
                                     delete=False, suffix='.json') as fout:
        json.dump(lemma, fout)
        filename = basename(fout.name)

    filename_csv = filename.replace('.json', '.csv')

    # The call to render_template should be abstracted away
    return flask.render_template('index.html', languages=languages,
                                 current_language=language,
                                 text_data=text_data,
                                 lemma=lemma,
                                 filename_json=filename,
                                 filename_csv=filename_csv)


@app.route('/about')
def about():
    # Just a quick meta page
    return flask.render_template('about.html')


@app.route('/download/<string:filename>')
def download(filename: str):
    # TODO: The logic should be separated from the route
    if filename.split('.')[-1] == 'json':
        # The JSON file already exists, so just return it
        return flask.send_file('download/' + filename)
    else:
        # We have to construct the CSV according to the JSON
        filename_json = filename.replace('.csv', '.json')
        filename_csv = app.config['APP_DOWNLOAD_PATH'] + '/' + filename
        with open(app.config['APP_DOWNLOAD_PATH'] + '/' + filename_json, 'r') as f:
            data = json.load(f)
            columns = list(set([x for row in data for x in row.keys()]))

            with open(filename_csv, 'w') as fout:
                csv_w = csv.writer(fout)
                csv_w.writerow(columns)
                for elem in data:
                    csv_w.writerow(map(lambda x: elem.get(x, ""), columns))
                return flask.send_file('download/' + filename)

        # If we are here something, went wrong
        return flask.render_template('index.html', languages=languages,
                                     error="Failed to send data!")


# JSON API should be as easy as this to implement:
@app.route('/api/lemma', methods=['GET', 'POST'])
def get_lemma():
    str = request.args['q']
    lemma = lemmatizer.tokenize(json.loads(str))
    return flask.Response(json.dumps(lemma), mimetype='application/json')


# JSON API language query:
@app.route('/api/get_languages', methods=['GET'])
def get_languages():
    return flask.Response(json.dumps(languages), mimetype='application/json')

if __name__ == '__main__':
    app.run()
