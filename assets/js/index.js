import { tweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

let storedTweetsData = JSON.parse(localStorage.getItem('tweetsData')) || tweetsData

if (storedTweetsData) {
    localStorage.setItem('tweetsData', JSON.stringify(storedTweetsData));
}

document.addEventListener('click', function (e) {
    if (e.target.dataset.like) {
        handleLikeClick(e.target.dataset.like)
    }
    else if (e.target.dataset.retweet) {
        handleRetweetClick(e.target.dataset.retweet)
    }
    else if (e.target.dataset.reply) {
        handleReplyClick(e.target.dataset.reply)
    }
    else if (e.target.id === 'tweet-btn') {
        handleTweetBtnClick()
    }
    else if (e.target.dataset.comment) {
        handleReplyTextBtnClick(e.target.dataset.comment)
    }
    else if (e.target.dataset.delete) {
        handleDelete(e.target.dataset.delete)
    }
})

function handleDelete(tweetId) {
    let tweetData = JSON.parse(localStorage.getItem('tweetsData')) || []
    tweetData = tweetData.filter(function (tweet) {
        return tweet.uuid !== tweetId
    })

    localStorage.setItem('tweetsData', JSON.stringify(tweetData))
    render()

}

function handleLikeClick(tweetId) {
    let tweetsData = JSON.parse(localStorage.getItem('tweetsData'))

    const targetTweetObj = tweetsData.filter(function (tweet) {
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isLiked) {
        targetTweetObj.likes--
    }
    else {
        targetTweetObj.likes++
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked
    localStorage.setItem('tweetsData', JSON.stringify(tweetsData))
    render()
}

function handleRetweetClick(tweetId) {
    let tweetsData = JSON.parse(localStorage.getItem('tweetsData'))

    const targetTweetObj = tweetsData.filter(function (tweet) {
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isRetweeted) {
        targetTweetObj.retweets--
    }
    else {
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
    localStorage.setItem('tweetsData', JSON.stringify(tweetsData))
    render()
}

function handleReplyClick(replyId) {
    document.getElementById(`replies-${replyId}`).classList.toggle('hidden')
}

function handleReplyTextBtnClick(tweetId) {
    console.log("T ID: " + tweetId)
    let tweetsData = JSON.parse(localStorage.getItem('tweetsData'))
    let replyInput = document.getElementById(`reply-input-${tweetId}`).value;
    console.log(replyInput)

    if (replyInput) {
        const targetTweetObj = tweetsData.find(function (tweet) {
            return tweet.uuid === tweetId;
        })

        targetTweetObj.replies.unshift({
            handle: `@rafaelnacle`,
            profilePic: `./assets/images/profile.jpg`,
            tweetText: replyInput,
        });

        localStorage.setItem('tweetsData', JSON.stringify(tweetsData));
        replyInput = '';

        render(tweetsData);
    }
}

function handleTweetBtnClick() {
    const tweetInput = document.getElementById('tweet-input')
    let tweetsData = JSON.parse(localStorage.getItem('tweetsData')) || []

    if (tweetInput.value) {
        tweetsData.unshift({
            handle: `@rafaelnacle`,
            profilePic: `./assets/images/profile.jpg`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4()
        })

        localStorage.setItem('tweetsData', JSON.stringify(tweetsData))
        render()
        tweetInput.value = ''
    }

}

function getFeedHtml() {
    let tweetsData = JSON.parse(localStorage.getItem('tweetsData'))
    let feedHtml = ``

    tweetsData.forEach(function (tweet) {

        let likeIconClass = ''

        if (tweet.isLiked) {
            likeIconClass = 'liked'
        }

        let retweetIconClass = ''

        if (tweet.isRetweeted) {
            retweetIconClass = 'retweeted'
        }

        let repliesHtml = ''

        if (tweet.replies.length > 0) {
            tweet.replies.forEach(function (reply) {
                repliesHtml += `
                <div class="tweet-reply">
                    <div class="tweet-inner">
                        <img src="${reply.profilePic}" class="profile-pic">
                        <div>
                            <p class="handle">${reply.handle}</p>
                            <p class="tweet-text">${reply.tweetText}</p>
                        </div>
                    </div>
                </div>
                `
            })
        }

        repliesHtml += `
            <div class="tweet-reply">
                <textarea id='reply-input-${tweet.uuid}' placeholder="Write your reply..."></textarea>
                <button class='reply-button' data-comment="${tweet.uuid}">Reply</button>
            </div>
        `

        feedHtml += `
        <div class="tweet">
            <div class="tweet-inner">
                <img src="${tweet.profilePic}" class="profile-pic">
                <div>
                    <p class="handle">${tweet.handle}</p>
                    <p class="tweet-text">${tweet.tweetText}</p>
                    <div class="tweet-details">
                        <span class="tweet-detail">
                            <i class="fa-regular fa-comment-dots"
                            data-reply="${tweet.uuid}"
                            ></i>
                            ${tweet.replies.length}
                        </span>
                        <span class="tweet-detail">
                            <i class="fa-solid fa-heart ${likeIconClass}"
                            data-like="${tweet.uuid}"
                            ></i>
                            ${tweet.likes}
                        </span>
                        <span class="tweet-detail">
                            <i class="fa-solid fa-retweet ${retweetIconClass}"
                            data-retweet="${tweet.uuid}"
                            ></i>
                            ${tweet.retweets}
                        </span>
                        
                    </div>
                    <div class="delete-container">
                            <i class="fa-solid fa-x delete-icon"
                            data-delete="${tweet.uuid}"
                            ></i>
                    </div> 
                </div>            
            </div>
            <div class="hidden" id="replies-${tweet.uuid}">
                ${repliesHtml}
            </div>   
        </div>
        `
    })
    return feedHtml
}

function renderReplyTexts() {
    const replyButtons = document.querySelectorAll('.reply-button')
    replyButtons.forEach(button => {
        button.addEventListener('click', function () {
            const tweetId = button.dataset.tweetId
            const replyInput = document.getElementById(`reply-input-${tweetId}`)
            handleReplyTextBtnClick(tweetId, replyInput)
        })
    })
}

function render() {
    document.getElementById('feed').innerHTML = getFeedHtml()

    renderReplyTexts()
}

render()

