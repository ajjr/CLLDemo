from cltk.tokenize.word import WordTokenizer
# from cltk.stem.lemma import LemmaReplacer
from cltk.lemmatize.greek.backoff import BackoffGreekLemmatizer
from cltk.lemmatize.latin.backoff import BackoffLatinLemmatizer
# from cltk.stop.greek.stops import STOPS_LIST
# from cltk.corpus.utils.formatter import tonos_oxia_converter
from cltk.corpus.utils.formatter import cltk_normalize


def tokenize(request):
    language = request['Content-Language']
    src_data = request['Payload']
    print(language)

    word_tokenizer = WordTokenizer(language)
    data = word_tokenizer.tokenize(src_data)
    clean_data = list(map(cltk_normalize,
                          [w for w in data if w.isalpha()]))
    # and not w in STOPS_LIST]

    # lemma = LemmaReplacer(language).lemmatize(clean_data)
    lemma = None
    if language == 'greek':
        lemma = BackoffGreekLemmatizer().lemmatize(clean_data)
    elif language == 'latin':
        lemma = BackoffLatinLemmatizer().lemmatize(clean_data)

    result = []
    for i, elem in enumerate(lemma):
        w, l = elem
        result.append({
            'index': i + 1,
            'word': w,
            'lemma': l
        })

    return result
