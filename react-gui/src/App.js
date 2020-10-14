import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';


const LemmaRow = function(props) {
  var lemma = props.lemma;
  return (
    <tr><td>{lemma.index}</td>
    <td>{lemma.word}</td>
    <td>{lemma.lemma}</td>
    </tr>
  );
}

const LanguageInput = function(props) {
  let lang_items = [];
  fetch('/api/get_languages').then(res => res.json()).then(data => {
    for (const key in data) {
      lang_items.push(
      <label htmlFor={key} key={key}>
      <input id={key} type="radio" name="language" value={key} />{data[key]}</label>);
    }
  });
  return lang_items
}

class Lemmatizer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "Ἐγένετο ἄνθρωπος, ἀπεσταλμένος παρὰ θεοῦ, ὄνομα αὐτῷ Ἰωάννης· οὗτος ἦλθεν εἰς μαρτυρίαν ἵνα μαρτυρήσῃ περὶ τοῦ φωτός, ἵνα πάντες πιστεύσωσιν δι᾿ αὐτοῦ.",
      lang: "greek",
      langs: undefined,
      lemma: []
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    

  }

  handleChange(event) {
    this.setState({
      text: event.target.value
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log("Submit event: ", this.state.text);
    let query = {
      "Content-Type": "text/plain",
      "Content-Language": this.state.lang,
      "Payload": this.state.text
    };
    fetch('/api/lemma?q=' + JSON.stringify(query)).then(res => res.json()).then(data => {
      this.setState({ lemma: data });
      // this.setState({
      //   lemma_formatted: data.map((item, index) =>
      //     <tr key={index}><td>{index}</td><td>{item.word}</td><td>{item.lemma}</td></tr>
      //   )
      // });
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
            <LanguageInput langs={this.state.langs}/>
          </div>
          <input type="submit" value="Submit" />
        </form>
        <table>
          <tbody>
            {this.state.lemma.map((row) => {
              return <LemmaRow key={row.index} lemma={row} />
            })}
          </tbody>
        </table>
      </div>);
  }
}



function App() {
  const query = {
    "Content-Type": "text/plain",
    "Content-Language": "greek",
    "Payload": "Ἐν ἀρχῇ ἦν ὁ λόγος"
  };
  // setQuery();
  const element = <Lemmatizer />;

  // const query = "Content-Type=text/plain&Content-Language=greek&Payload=Ἐν%20%ἀρχῇ%20%ἦν%20%ὁ%20%λόγος"
  // "Content-Type": "text/plain",
  // "Content-Language": "greek",
  // "Payload": "Ἐν ἀρχῇ ἦν ὁ λόγος"
  // console.log(query);
  // useEffect(() => {
  //   fetch('/api/get_languages').then(res => res.json()).then(data => {
  //     this.setState({langs: data});
  //   })
  //  }, []);

  return (
    <div className="App">
      <header className="App-header">

      </header>
      {element}
    </div>
  );
}

export default App;
