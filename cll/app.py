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

    if text_data.strip() == "" or len(text_data) > 1000:
        return flask.render_template('index.html', languages=languages)

    text_qry = {'Content-Type': "text/plain",
                'Content-Language': language,
                'Payload': text_data}
    lemma = lemmatizer.tokenize(text_qry)

    filename = None
    with tempfile.NamedTemporaryFile(mode='w',
                                     dir=app.config['APP_DOWNLOAD_PATH'],
                                     delete=False, suffix='.json') as fout:
        json.dump(lemma, fout)
        filename = basename(fout.name)

    filename_csv = filename.replace('.json', '.csv')

    return flask.render_template('index.html', languages=languages,
                                 current_language=language,
                                 text_data=text_data,
                                 lemma=lemma,
                                 filename_json=filename,
                                 filename_csv=filename_csv)


@app.route('/about')
def about():
    return flask.render_template('about.html')


@app.route('/download/<string:filename>')
def download(filename: str):
    if filename.split('.')[-1] == 'json':
        return flask.send_file('download/' + filename)
    else:
        filename_json = filename.replace('.csv', '.json')
        filename_csv = app.config['APP_DOWNLOAD_PATH'] + filename
        with open(app.config['APP_DOWNLOAD_PATH'] + filename_json, 'r') as f:
            data = json.load(f)
            columns = list(set([x for row in data for x in row.keys()]))

            with open(filename_csv, 'w') as fout:
                csv_w = csv.writer(fout)
                csv_w.writerow(columns)
                for elem in data:
                    csv_w.writerow(map(lambda x: elem.get(x, ""), columns))
                return flask.send_file('download/' + filename)

        return flask.render_template('index.html', languages=languages,
                                     error="Failed to send data!")


if __name__ == '__main__':
    app.run()
