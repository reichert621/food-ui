import React from "react";
import ReactDOM from "react-dom";
import moment from "moment";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.less";

const Attachment = ({ attachment }) => {
  if (!attachment || !attachment.type || !attachment.payload) {
    return null;
  }

  const { type, payload } = attachment;
  const uri = payload["firebase-uri"];

  switch (type) {
    case "image":
      return <img src={uri} />;
    case "video":
      return (
        <video controls>
          <source src={uri} />
        </video>
      );
    case "audio":
      return (
        <audio controls>
          <source src={uri} />
        </audio>
      );
  }
};

const Event = ({ event }) => {
  if (!event) return null;

  const {
    message: { text, attachments = [] },
    timestamp
  } = event;
  const prettyDate = moment(+timestamp).format("ddd MMM DD hh:mm a");

  return (
    <li>
      <div>
        <b>{prettyDate}</b>
      </div>
      <ul>
        {text && <li>{text}</li>}
        {attachments &&
          attachments.map((att, idx) => {
            return (
              <div key={idx} className="attachment-container">
                <Attachment attachment={att} />
              </div>
            );
          })}
      </ul>
    </li>
  );
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: null };
  }

  componentDidMount() {
    const userHash = window.location.pathname.slice(1);

    if (!userHash) {
      this.setState({ data: {} });
      return;
    }

    window
      .fetch(`https://nutritionapi.herokuapp.com/users/${userHash}`)
      .then(res => res.json())
      .then(data => this.setState({ data }))
      .catch(err => {
        console.log("Error!", err);
        this.setState({ data: {} });
      });
  }

  render() {
    const { data } = this.state;

    if (!data) {
      return <div>Loading...</div>;
    }

    if (Object.keys(data).length === 0) {
      return <div>Log something!</div>;
    }

    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <div>
          <ul>
            {Object.keys(data)
              .sort()
              .reverse()
              .map(ts => data[ts])
              .filter(event => event)
              .map(event => {
                return <Event key={event.timestamp} event={event} />;
              })}
          </ul>
        </div>
      </div>
    );
    return (
      <div className="container ports-container">
        <h1>Nutrition!</h1>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
