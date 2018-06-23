// v2
const express = require('express');
const bodyParser = require('body-parser');
const { dialogflow, BasicCard, Button } = require('actions-on-google');
const fetch = require('node-fetch');

const app = dialogflow();

app.intent('hn-top', conv => {

    // https://hacker-news.firebaseio.com/v0/topstories.json

    return fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    .then((res) => res.json())
    .then((ids) => {

        const id = ids[0];
        return fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
        .then((res) => res.json())
        .then((story) => {

            conv.ask(`Top story on HN right now is "${story.title}".`);
            conv.ask(new BasicCard({
                title: story.title,
                subtitle: `${story.descendants} comments, ${story.score} points`,
                text: `test`,
                buttons: new Button({
                    title: 'CLICK ME',
                    url: story.url,
                }),
            }));

        }).catch((err) => {
            conv.ask('Something went wrong!');
            console.log(err);
        });

    }).catch((err) => {
        conv.ask('Something went wrong!');
        console.log(err);
    });

});


express().use(bodyParser.json(), app).listen(8080);