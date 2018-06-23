// v2
const express = require('express');
const bodyParser = require('body-parser');
const { dialogflow, BrowseCarousel, BrowseCarouselItem } = require('actions-on-google');
const fetch = require('node-fetch');

const app = dialogflow();

app.intent('hn-top', conv => {

    // Fetch list of top story ids.
    return fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    .then((res) => res.json())
    .then((ids) => {

        // Define array of request promises to get the full stories.
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

app.intent('reddit-top', (conv, data) => {

    // Make a request for the top posts of the subreddit.
    return fetch(`https://www.reddit.com/r/${data.subreddit}/top.json`)
    .then((res) => res.json())
    .then(posts => {

        // The posts are actually here in the response.
        posts = posts.data.children.splice(0, 10);

        // Reply (with a browse carousel).
        conv.ask(`Here are the top posts on /r/${data.subreddit} right now.`);
        conv.ask(new BrowseCarousel({
            items: posts.map(post => {
                return new BrowseCarouselItem({
                    title: post.data.title,
                    url: post.data.url,
                    description: `${post.data.score} points, ${post.data.num_comments} comments`,
                });
            }),
        }));
    })
    .catch((err) => {
        conv.ask('Something went wrong! Is that a valid subreddit?');
        console.log(err);
    });

});


express().use(bodyParser.json(), app).listen(8080);