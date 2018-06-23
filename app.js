// v2
const express = require('express');
const bodyParser = require('body-parser');
const { dialogflow, BrowseCarousel, BrowseCarouselItem } = require('actions-on-google');
const fetch = require('node-fetch');

const app = dialogflow();

app.intent('hn-top', conv => {

    // https://hacker-news.firebaseio.com/v0/topstories.json

    return fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    .then((res) => res.json())
    .then((ids) => {

        // Define array of request promises.
        let promises = [];
        for (let i = 0; i < 10; i++) {
            promises.push(fetch(`https://hacker-news.firebaseio.com/v0/item/${ids[i]}.json`)
            .then((res) => res.json())
            .catch((err) => {
                conv.ask('Something went wrong!');
                console.log(err);
            }));
        }

        // Once they're all finished, build a browser carousel and reply with that.
        return Promise.all(promises).then((stories) => {
            conv.ask('Here are the top stories on HN right now.');
            conv.ask(new BrowseCarousel({
                items: stories.map(story => {
                    return new BrowseCarouselItem({
                        title: story.title,
                        url: story.url,
                        description: `${story.score} points, ${story.descendants} comments`,
                    });
                }),
            }));
        });

    }).catch((err) => {
        conv.ask('Something went wrong!');
        console.log(err);
    });

});


express().use(bodyParser.json(), app).listen(8080);