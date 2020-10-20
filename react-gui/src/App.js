import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

/* GUI Elements */

/* ResultsTable: Renders the resulting lemma */
class ResultsTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = { lemma: props.lemma };
  }

  renderRow() {
    return this.props.lemma.map((row) => {
      const {index, word, lemma} = row
      return (
        <tr key={index}>
          <td>{index}</td>
          <td>{word}</td>
          <td>{lemma}</td>
        </tr>
      )
    })
  }

  render() {
    return (
      <table id="lemmaresult">
        <tbody>
          {this.renderRow()}
        </tbody>
      </table> )
  }
}

/* LanguageForm: Language chooser for supported languages */
class LanguageForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      value: "greek",
      langs: [] };
    this.handleChange = this.handleChange.bind(this);
    //this.handleSubmit = this.handleSubmit.bind(this);
    fetch('/api/get_languages').then(res => res.json()).then(data => {
      this.setState({ langs: data })
    });
  }

  handleChange(event) {
    this.setState({ value: event.target.value })
    this.props.lemmatizer.setLang(event.target.value)
  }

  renderRow() {
    return Object.keys(this.state.langs).map((key) => {
      return (<option value={key}>{this.state.langs[key]}</option>)
    });
  }

  render() {
    return (
      <select name="lang" value={this.state.value} id="lang-choice" onChange={this.handleChange}>
        {this.renderRow()}
      </select>
    );
  }

}


/* Timer: Count down seconds during lemma fetch */
class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: Date.now(),
      seconds: parseInt(props.startTimeInSeconds, 10) || 0
    };
  }

  tick() {
    this.setState(state => ({
      seconds: state.seconds + 1
    }));
  }

  componentDidMount() {
    this.interval = setInterval(() => this.setState(state => ({
      seconds: state.seconds + 1
    })), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render(){
    return(
      <div>{ this.state.seconds } </div>
    );
  }
}


/* Lemmatizer: main GUI logic for requesting text lemmatizion via simple REST api */
class Lemmatizer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "Ἐγένετο ἄνθρωπος, ἀπεσταλμένος παρὰ θεοῦ, ὄνομα αὐτῷ Ἰωάννης· οὗτος ἦλθεν εἰς μαρτυρίαν ἵνα μαρτυρήσῃ περὶ τοῦ φωτός, ἵνα πάντες πιστεύσωσιν δι᾿ αὐτοῦ.",
      lang: "greek",
      langs: undefined,
      lemma: [],
      busy: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

  }

  handleChange(event) {
    this.setState({
      text: event.target.value
    });
  }

  setLang(lang) {
    this.setState({ lang: lang });
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log("Submit event: ", this.state.text);
    let query = {
      "Content-Type": "text/plain",
      "Content-Language": this.state.lang,
      "Payload": this.state.text
    };
    this.setState({busy: true});
    fetch('/api/lemma?q=' + JSON.stringify(query)).then(res => res.json()).then(data => {
      this.setState({ lemma: data, busy: false });
    });
  }

  render() {

    const lang_items = []
    for (const key in this.state.langs) {
      lang_items.push(
        <label htmlFor={key} key={key}>
          <input id={key} type="radio" name="language" value={key} />{this.state.langs[key]}</label>);
    }

    return (
      <div>
        <h1>Lemmatizer</h1>
        <form action="/" onSubmit={this.handleSubmit}>
          <textarea name="text" rows="15" onChange={this.handleChange}>
            {this.state.text}
          </textarea>
          <div class="col" id="language_input">
            <LanguageForm lemmatizer={this} />
          </div>
          <input type="submit" value="Submit" />
        </form>
        {this.state.busy ? <Timer /> : <ResultsTable lemma={this.state.lemma} /> }
      </div>);
  }
}



function App() {
  const query = {
    "Content-Type": "text/plain",
    "Content-Language": "greek",
    "Payload": "Ἐν ἀρχῇ ἦν ὁ λόγος"
  };
  const element = <Lemmatizer />;

  return (
    <div className="App">
      <header className="App-header">

      </header>
      {element}
    </div>
  );
}

export default App;
