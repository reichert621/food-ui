import React from "react";
import ReactDOM from "react-dom";
import startOfDay from "date-fns/start_of_day";
import format from "date-fns/format";
import groupBy from "lodash/groupBy";
import map from "lodash/map";

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

  const { message: { text, attachments = [] }, timestamp } = event;

  return (
    <li className="entry">
      <div className="entry-time">{format(timestamp, "h:mma")}</div>
      <div className="entry-content">
        {text ? (
          <div className="entry-text">{text}</div>
        ) : (
          <div className="entry-attachment-container">
            <Attachment attachment={attachments[0]} />
          </div>
        )}
      </div>
    </li>
  );
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { entriesByDate: null };
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
      .then(rawEntries => {
        const parsedEntries = Object.values(rawEntries);
        const entriesByDate = map(
          groupBy(parsedEntries, e => startOfDay(e.timestamp).getTime()),
          (v, k) => ({
            date: parseInt(k),
            entries: v.sort((x, y) => x.timestamp - y.timestamp)
          })
        ).sort();
        this.setState({ entriesByDate });
      })
      .catch(err => {
        console.log("Error!", err);
        this.setState({ data: {} });
      });
  }

  onValue = snapshot => {
    const rawEntries = snapshot.val();
  };

  render() {
    const { entriesByDate } = this.state;

    if (!entriesByDate) {
      return <div>Loading...</div>;
    }

    if (Object.keys(entriesByDate).length === 0) {
      return <div>Log something!</div>;
    }

    return (
      <div>
        <h1 className="header">🍏 kareem</h1>
        {entriesByDate.map(({ date, entries }) => (
          <div className="day">
            <h3 className="day-date">{format(date, "ddd, MMM D")}</h3>
            <ul className="entries">
              {entries.map(event => (
                <Event key={event.timestamp} event={event} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
