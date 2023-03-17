import {
    fetchCurrentUserConversation, fetchUserById, fetUsersByName,
    unFriendRequest, addFriendRequest, unRequestAddFriend, aceeptResquest,
    unAcceptRequest, getCurrentUserData, getTimeElapsed, addDocument, setSelectedChat,
    getSelectedChat, fetchConverstationByRecieverId, fetchAllCurrentMessages, fetchLastMessages,
    uploadImage, addConverstation
} from '../firebase/service.js';
import {
    getFirestore, getDoc, updateDoc, arrayUnion, arrayRemove, doc, setDoc, addDoc,
    onSnapshot, collection, query, where, orderBy, limit, serverTimestamp
}
    from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { authThentication } from './auth.js'
authThentication.init();

var incomingRequestList = ["opportunity@life.com"];
var outgoingRequestList = ["hope@life.com"];
var chatOn = false;
var unSubcribeMessage = null;

var menu = document.getElementById('menu');
var chatWindow = document.getElementById('chatWindow');

var sendMessageInput = document.getElementById("sendMessage");
var fileInput = document.getElementById("fileInput");
var fileBtn = document.getElementById("fileBtn");

var chatsBtn = document.getElementById('chatsBtn');
var groupsBtn = document.getElementById('groupsBtn');
var friendsBtn = document.getElementById('friendsBtn');
var peopleBtn = document.getElementById('peopleBtn');
var backBtn = document.querySelector('#backBtn');

var chats = document.getElementById('chats');
var groups = document.getElementById('groups');
var friends = document.getElementById('friends');
var people = document.getElementById('people');

var conversationsDiv = document.getElementById('conversations');
var sendBtn = document.getElementById("sendBtn");

var signOutBtn = document.getElementById('signOutBtn');

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

var peopleDivDefaultHtml =
    `
<div id="searchPeopleDiv" class="row">
<a href="" id="searchPeopleBtn" class="brn col">
    <i id="searchPeopleIcon" class="material-icons">search</i>
</a>

<input id="searchPeopleInput" placeholder="Search People By Email" type="text" class="col" onkeypress="searchPeople(event)" >
</div>

<div id="requestsLabelDiv">
<p id="requestsLabel">Requests</p>
</div>
`;

/********************************Build app **********************/

/************************ MENU *********************************/

document.addEventListener('DOMContentLoaded', function () {
    const userData = getCurrentUserData();
    $('#profilePicture').src = userData.picture || userData.picture
    $('#profileName').innerHTML = userData.displayName || userData.name

    // console.log(userData)

    var currently = localStorage.getItem("currently");
    if (currently === "chats" || !currently) {
        chatsBtn.click();
    } else if (currently === "groups") {
        groupsBtn.click();
    } else if (currently === "friends") {
        friendsBtn.click();
    } else if (currently === "people") {
        peopleBtn.click();
    }
});

backBtn.addEventListener('click', function (e) {
    e.preventDefault();
    chatOn = false;
    unSubcribeMessage()
    chatsBtn.click();
});

chatsBtn.addEventListener('click', function (e) {
    e.preventDefault();
    setActive(this);
    displayChats();
});

groupsBtn.addEventListener('click', function (e) {
    e.preventDefault();
    setActive(this);
    alert("This is for you to make! " + "\n" + "Best of Luck")
    // displayGroups();
});

friendsBtn.addEventListener('click', function (e) {
    e.preventDefault();
    setActive(this);
    displayFriends();
});

peopleBtn.addEventListener('click', function (e) {
    e.preventDefault();
    setActive(this);
    displayPeople();
});

function setActive(x) {
    chatsBtn.parentElement.classList.remove('active');
    groupsBtn.parentElement.classList.remove('active');
    friendsBtn.parentElement.classList.remove('active');
    peopleBtn.parentElement.classList.remove('active');
    chats.classList.add('hide');
    groups.classList.add('hide');
    friends.classList.add('hide');
    people.classList.add('hide');
    conversations.classList.add('hide');

    var currently;
    if (x === chatsBtn) {
        currently = "chats";
        chatsBtn.parentElement.classList.add('active');
        chats.classList.remove('hide');
        chatOn = false;
    } else if (x === groupsBtn) {
        currently = "groups";
        groupsBtn.parentElement.classList.add('active');
        groups.classList.remove('hide');
    } else if (x === friendsBtn) {
        currently = "friends";
        friendsBtn.parentElement.classList.add('active');
        friends.classList.remove('hide');
    } else if (x === peopleBtn) {
        currently = "people";
        peopleBtn.parentElement.classList.add('active');
        people.classList.remove('hide');
    }

    localStorage.setItem("currently", currently);

    if (chatWindow.classList.contains('hide')) {
        chatWindow.classList.remove('hide');
        menu.classList.remove('show');
    };
}

/************************NAVIGATION*********************************/

// For Tabs
function openTab(tabName) {
    var i, tabcontent;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    document.getElementById(tabName).style.display = "block";
}

// For Side Nav Toggle
var menuBtns = document.querySelectorAll('#menuBtn');
for (var i = 0; i < menuBtns.length; i++) {
    menuBtns[i].addEventListener('click', function (e) {
        e.preventDefault();
        chatWindow.classList.add('hide');
        menu.classList.add('show');
    });
}

/************************AUTH*********************************/
// // Handling Sign Out
signOutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signOutBtnIcon').innerHTML = "autorenew";
    document.getElementById('signOutBtnIcon').classList.add('loadingIcon');

    setTimeout(() => {

        authThentication.signOut();

        document.getElementById('signOutBtnIcon').innerHTML = "exit_to_app";
        document.getElementById('signOutBtnIcon').classList.remove('loadingIcon');

        document.getElementById('chatsDiv').innerHTML = "";
        document.getElementById('friendsDiv').innerHTML = "";
        // document.getElementById('peopleDiv').innerHTML = peopleDivDefaultHtml;
        document.getElementById('peopleDiv').innerHTML = '';

    }, 3000);

    // Handle Error
    // document.getElementById('signOutBtnIcon').innerHTML = "exit_to_app";
    // document.getElementById('signOutBtnIcon').classList.remove('loadingIcon');
    // alert('Ensure Internet Connection to Sign Out');
});

/************************************ PEOPLE SECTION ******************************************/
// // Handing Change Section
$('.searchNavText').onclick = (e) => {
    $('.searchSection').classList.remove('hide')
    $('.requestsSection').classList.add('hide')

    $("#searchPeopleInput").value = null;
    cleanOutput();
}
$('.requestsNavText').onclick = (e) => {
    $('.searchSection').classList.add('hide')
    $('.requestsSection').classList.remove('hide')
    cleanOutput();
    renderRequest();
}
function displayPeople() {
    outgoingRequestList.forEach(people => {
        renderPeople("outgoing", people);
    });

    incomingRequestList.forEach(people => {
        renderPeople("incoming", people);
    });
}
function renderNotFound(type) {
    var notFoundDiv = document.createElement('div');
    notFoundDiv.id = 'notFoundDiv';
    if (type == 'searchResult') {
        notFoundDiv.classList.add('searchResult');
    }

    var notFoundP = document.createElement('p');
    notFoundP.id = 'notFoundP';

    if (type == 'requests') {
        notFoundP.appendChild(document.createTextNode('No Requests Available'));
    } else if (type == 'searchResult') {
        notFoundP.appendChild(document.createTextNode('No People Found'));
    }

    notFoundDiv.appendChild(notFoundP);

    if (type == 'requests') {
        notFoundDiv.appendAfter(document.getElementById('requestsLabelDiv'));
    } else if (type == 'searchResult') {
        document.querySelector('#searchPeopleIcon').classList.remove('loadingIcon');
        document.querySelector('#searchPeopleIcon').innerHTML = "";
        document.querySelector('#searchPeopleIcon').appendChild(document.createTextNode('search'));

        notFoundDiv.appendAfter(document.getElementById('searchPeopleDiv'));
    }
}
document.getElementById("searchPeopleInput").onkeydown = async (e) => {
    if (e.keyCode === 13 && e.target.value.length > 1) {
        e.preventDefault();

        document.querySelector('#searchPeopleIcon').innerHTML = "";
        document.querySelector('#searchPeopleIcon').appendChild(document.createTextNode('autorenew'));
        document.querySelector('#searchPeopleIcon').classList.add('loadingIcon');

        cleanOutput();
        // test render
        // setTimeout(() => {
        //     document.querySelector('#searchPeopleIcon').classList.remove('loadingIcon');
        //     createWrapperAfterNode('ul', $('#searchPeopleDiv'), 'wapperSearchPeopleItem')

        //     testRenderUser().map(user => {
        //         renderPeople('searchResultGeneral', user);
        //     })
        // }, 1000);

        const result = await fetUsersByName(e.target.value)
        const { id } = getCurrentUserData();
        if (result.length === 0) {
            renderNotFound('searchResult');
            document.querySelector('#searchPeopleIcon').classList.remove('loadingIcon');
        } else {
            createWrapperAfterNode('ul', $('#searchPeopleDiv'), 'wapperSearchPeopleItem')
            const searchOutput = result.filter(user => user.id !== id)
            if (searchOutput.length === 0) {
                renderNotFound('searchResult');
                document.querySelector('#searchPeopleIcon').classList.remove('loadingIcon');
            } else
                searchOutput.map(user => {
                    if (user.listFriend.includes(id))
                        renderPeople('searchResultFriend', user);
                    else
                        renderPeople('searchResultGeneral', user);
                })
        }
    }
    if (e.target.value.length === 1) {
        cleanOutput();
    }
}

function renderRequest() {
    createWrapperAfterNode('ul', $('.requestsSection'), 'wapperRequestPeopleItem');
    const { listRequest } = getCurrentUserData()
    //Khong co snapshot
    // fetchUserById(id)
    //     .then(user => {
    //         if (user.listRequest.length === 0)
    //             renderNotFound('requests')
    //         else
    //             user.listRequest.map(async (uidRequest) => {
    //                 const userRequest = await fetchUserById(uidRequest)
    //                 renderPeople('searchResultIncoming', userRequest);
    //             })
    //     })
    if (listRequest.length === 0)
        renderNotFound('requests')
    else
        listRequest.map(async (uidRequest) => {
            const userRequest = await fetchUserById(uidRequest)
            renderPeople('searchResultIncoming', userRequest);
        })

}
function renderPeople(type, userInfo) {
    var peopleItem = document.createElement('li');
    peopleItem.id = "peopleItem";
    peopleItem.classList.add('row');

    if (type == 'searchResultGeneral' || type == 'searchResultIncoming' || type == 'searchResultOutgoing' || type == 'searchResultFriend') {
        peopleItem.classList.add('searchResult');
    }

    var picture = document.createElement('img');
    picture.id = "picture";
    picture.src = userInfo.picture;
    picture.classList.add('col');
    peopleItem.appendChild(picture);

    var details = document.createElement('div');
    details.id = "details";
    details.classList.add('col');

    var detailsInside = document.createElement('div');
    detailsInside.id = "detailsInside";

    var peopleTitle = document.createElement('p');
    peopleTitle.id = "peopleTitle";
    peopleTitle.appendChild(document.createTextNode(userInfo.name));

    var peopleBio = document.createElement('p');
    peopleBio.id = "peopleBio";
    peopleBio.appendChild(document.createTextNode(userInfo.email));

    detailsInside.appendChild(peopleTitle);
    detailsInside.appendChild(peopleBio);
    details.appendChild(detailsInside);
    peopleItem.appendChild(details);

    var status = document.createElement('div');
    status.id = "status";
    status.classList.add('col');

    var statusInside = document.createElement('div');
    statusInside.id = "statusInside";

    var peopleAddFriend = document.createElement('a');
    peopleAddFriend.id = "peopleAddFriend";
    peopleAddFriend.href = "";

    var addFriend = document.createElement('i');
    addFriend.classList.add('material-icons');
    addFriend.classList.add('addFriend');

    if (type == "searchResultGeneral") {
        addFriend.appendChild(document.createTextNode("person_add"));
    } else if (type == "outgoing" || type == 'searchResultOutgoing') {
        addFriend.appendChild(document.createTextNode("person_add_disabled"));
    } else if (type == "incoming" || type == 'searchResultIncoming') {
        addFriend.appendChild(document.createTextNode("check"));
    }

    if (type == "incoming" || type == 'searchResultIncoming') {
        var peopleRejectFriend = document.createElement('a');
        peopleRejectFriend.id = "peopleAddFriend";
        peopleRejectFriend.href = "";

        var rejectFriend = document.createElement('i');
        rejectFriend.classList.add('material-icons');
        rejectFriend.classList.add('addFriend');

        rejectFriend.appendChild(document.createTextNode("clear"));

        rejectFriend.addEventListener('click', (e) => {
            e.preventDefault();
            handleFriendRequest("reject", userInfo.email, addFriend, rejectFriend);
        });

        peopleRejectFriend.appendChild(rejectFriend);
    }

    addFriend.addEventListener('click', (e) => {
        e.preventDefault();
        if (addFriend.innerHTML == "check") {
            handleFriendRequest("accept", userInfo.id, addFriend, rejectFriend);
        } else if (addFriend.innerHTML == "person_add") {
            addAsFriend("send", userInfo.id, addFriend);
        } else {
            addAsFriend("cancel", userInfo.id, addFriend);
        }
    });

    peopleAddFriend.appendChild(addFriend);

    var peopleViewProfile = document.createElement('a');
    peopleViewProfile.id = "peopleViewProfile";
    peopleViewProfile.href = "";

    var viewPeopleProfile = document.createElement('i');
    viewPeopleProfile.classList.add('material-icons');
    viewPeopleProfile.classList.add('viewPeopleProfile');
    viewPeopleProfile.appendChild(document.createTextNode("info"));

    viewPeopleProfile.addEventListener('click', (e) => {
        e.preventDefault();
        alert("Set Up Profile Page Here!");
    });

    peopleViewProfile.appendChild(viewPeopleProfile);
    statusInside.appendChild(peopleAddFriend);
    if (type == "incoming" || type == 'searchResultIncoming') {
        statusInside.appendChild(peopleRejectFriend);
    }
    statusInside.appendChild(peopleViewProfile);
    status.appendChild(statusInside);
    peopleItem.appendChild(status);

    if (type == 'searchResultGeneral' || type == 'searchResultIncoming' || type == 'searchResultOutgoing' || type == 'searchResultFriend') {
        document.querySelector('#searchPeopleIcon').classList.remove('loadingIcon');
        document.querySelector('#searchPeopleIcon').innerHTML = "";
        document.querySelector('#searchPeopleIcon').appendChild(document.createTextNode('search'));
        $('.wapperSearchPeopleItem')?.appendChild(peopleItem)
    }
    if (type == 'searchResultGeneral') {
        $('.wapperSearchPeopleItem')?.appendChild(peopleItem)
    } else if (type == 'searchResultIncoming') {
        $('.wapperRequestPeopleItem')?.appendChild(peopleItem)
    }
}

function addAsFriend(status, friendId, addFriend) {
    addFriend.innerHTML = 'autorenew';
    addFriend.classList.add('loadingIcon');
    const { id } = getCurrentUserData();
    setTimeout(() => {
        if (status == "send") {
            addFriend.innerHTML = "";
            addFriend.classList.remove('loadingIcon');
            addFriend.appendChild(document.createTextNode("person_add_disabled"));
            addFriendRequest(id, friendId)
        } else if (status == "cancel") {
            addFriend.innerHTML = "";
            addFriend.classList.remove('loadingIcon');
            addFriend.appendChild(document.createTextNode("person_add"));
            unRequestAddFriend(id, friendId)
        }
    }, 1000);
}
function handleFriendRequest(status, friendId, addFriend, rejectFriend) {
    rejectFriend.style.display = "none";
    addFriend.innerHTML = 'autorenew';
    addFriend.classList.add('loadingIcon');

    setTimeout(() => {
        if (status == "accept") {
            addFriend.innerHTML = "";
            rejectFriend.innerHTML = "";
            addFriend.classList.remove('loadingIcon');
            addFriend.style.display = "none";
            rejectFriend.style.display = "none";
            const { id } = getCurrentUserData()
            aceeptResquest(id, friendId)
        } else if (status == "reject") {
            addFriend.innerHTML = "";
            rejectFriend.innerHTML = "";
            addFriend.classList.remove('loadingIcon');
            rejectFriend.style.display = "none";
            addFriend.appendChild(document.createTextNode("person_add"));
            const { id } = getCurrentUserData()
            unAcceptRequest(id, friendId)
        }
    }, 1000);
}
function testRenderUser() {
    return [
        {
            displayName: "Anh Nguyễn Thế",
            email: "2151013002anh@ou.edu.vn",
            // picture: "/images/avata2.jpg",
            id: "103488712315886769273",
        },
        {
            displayName: "Tran Thi Ngoc",
            email: "tranthingoc@ou.edu.vn",
            // picture: "/images/avata2.jpg",
            id: "103488712315886769273",
        },
        {
            displayName: "Do Van Minh",
            email: "dovanminh@ou.edu.vn",
            // picture: "/images/avata2.jpg",
            id: "103488712315886769273",
        },
    ]
}
function createWrapperAfterNode(element, afterElement, className) {
    var wrapper = document.createElement(element);
    wrapper.classList.add(className);
    wrapper.appendAfter(afterElement);
}
function cleanOutput() {
    $$('.wapperRequestPeopleItem').forEach((elem) => {
        elem.parentElement.removeChild(elem);
    });
    $$('.wapperSearchPeopleItem').forEach((elem) => {
        elem.parentElement.removeChild(elem);
    });
    $$('#notFoundDiv').forEach((elem) => {
        elem.parentElement.removeChild(elem);
    });
}
function GetElementInsideContainer(containerID, childID) {
    var elm = document.getElementById(childID);
    var parent = elm ? elm.parentNode : null;
    return (parent?.id === containerID) ? elm : null;
}
Element.prototype.appendAfter = function (element) {
    element.parentNode.insertBefore(this, element.nextSibling);
}
/************************************ FRIENDS SECTION ******************************************/
function displayFriends() {
    document.getElementById('friendsDiv').innerHTML = "";
    const currentUser = getCurrentUserData();
    const { listFriend } = getCurrentUserData();
    if (listFriend && listFriend.length > 0) {
        listFriend.map(async friendId => {
            const result = await fetchUserById(friendId)
            renderFriend(result)
        })
    }
}

function renderFriend(friend) {
    var friendItem = document.createElement('li');
    friendItem.id = "friendItem";
    friendItem.classList.add('row');

    var picture = document.createElement('img');
    picture.id = "picture";
    picture.src = friend.picture;
    picture.classList.add('col');
    friendItem.appendChild(picture);

    var details = document.createElement('div');
    details.id = "details";
    details.classList.add('col');

    var detailsInside = document.createElement('div');
    detailsInside.id = "detailsInside";

    var friendTitle = document.createElement('p');
    friendTitle.id = "friendTitle";
    friendTitle.appendChild(document.createTextNode(friend.name));

    var friendLastActive = document.createElement('p');
    friendLastActive.id = "friendLastActive";

    friendLastActive.appendChild(document.createTextNode(getTimeElapsed('milliseconds', friend.lastLoginAt)));

    detailsInside.appendChild(friendTitle);
    detailsInside.appendChild(friendLastActive);
    details.appendChild(detailsInside);
    friendItem.appendChild(details);

    var status = document.createElement('div');
    status.id = "status";
    status.classList.add('col');

    var statusInside = document.createElement('div');
    statusInside.id = "statusInside";

    var friendChatWith = document.createElement('a');
    friendChatWith.id = "friendChatWith";
    friendChatWith.href = "";

    var messageFriend = document.createElement('i');
    messageFriend.classList.add('material-icons');
    messageFriend.classList.add('messageFriend');
    messageFriend.appendChild(document.createTextNode("message"));

    messageFriend.addEventListener('click', (e) => {
        e.preventDefault();
        chatWithFriend(friend, messageFriend);
    });

    friendChatWith.appendChild(messageFriend);

    var friendViewProfile = document.createElement('a');
    friendViewProfile.id = "friendViewProfile";
    friendViewProfile.href = "";

    var viewFriendProfile = document.createElement('i');
    viewFriendProfile.classList.add('material-icons');
    viewFriendProfile.classList.add('viewFriendProfile');
    viewFriendProfile.appendChild(document.createTextNode("info"));

    viewFriendProfile.addEventListener('click', (e) => {
        e.preventDefault();
        alert("Set Up Profile Page Here!");
    });

    friendViewProfile.appendChild(viewFriendProfile);
    statusInside.appendChild(friendChatWith);
    statusInside.appendChild(friendViewProfile);
    status.appendChild(statusInside);
    friendItem.appendChild(status);

    document.getElementById('friendsDiv').appendChild(friendItem);
}

async function chatWithFriend(friend, messageFriendBtn) {
    messageFriendBtn.innerHTML = 'autorenew';
    messageFriendBtn.classList.add('loadingIcon');

    const hasConverstation = await fetchConverstationByRecieverId(friend.id);
    if (!hasConverstation)
        addConverstation(friend)
    setTimeout(() => {
        messageFriendBtn.innerHTML = '';
        messageFriendBtn.classList.remove('loadingIcon');
        messageFriendBtn.appendChild(document.createTextNode("message"));

        openConversation(friend, 'openFromFriendDiv');

    }, 2000);
}
/************************************ CHATS SECTION ******************************************/
async function displayChats() {
    document.getElementById('chatsDiv').innerHTML = "";
    // renderChat(0, "theanh@gmail.com", "Helllooooo", "1d ago", 3);
    const chats = await fetchCurrentUserConversation();
    const { id } = getCurrentUserData();
    chats.map(async chat => {
        const friendId = chat.members.filter(memberId => memberId !== id)
        const friend = await fetchUserById(friendId[0])
        const messages = await fetchLastMessages(chat.id)
        const lastMessage = messages.filter(message => message.senderId !== id).sort((a, b) => b.createAt - a.createAt)[0]
        if (lastMessage) {
            renderChat(friend, lastMessage.text, getTimeElapsed(lastMessage.createAt.seconds), 1, chat);
        }
    })
}

function renderChat(friend, lastMessage, lastAt, notification, chat) {
    var chatItem = document.createElement('li');
    chatItem.id = "chatItem";
    chatItem.classList.add('row');

    var picture = document.createElement('img');
    picture.id = "picture";
    picture.src = "";
    picture.classList.add('col');

    var details = document.createElement('div');
    details.id = "details";
    details.classList.add('col');

    var detailsInside = document.createElement('div');
    detailsInside.id = "detailsInside";

    var chatTitle = document.createElement('p');
    chatTitle.id = "chatTitle";

    chatTitle.appendChild(document.createTextNode(friend.name));

    var chatLastMessage = document.createElement('p');
    chatLastMessage.id = "chatLastMessage";

    // If last message is too long
    if (lastMessage.length > 25) {
        chatLastMessage.appendChild(document.createTextNode(lastMessage.substring(0, 22) + '...'));
    } else {
        chatLastMessage.appendChild(document.createTextNode(lastMessage));
    }

    detailsInside.appendChild(chatTitle);
    detailsInside.appendChild(chatLastMessage);
    details.appendChild(detailsInside);

    var status = document.createElement('div');
    status.id = "status";
    status.classList.add('col');

    var statusInside = document.createElement('div');
    statusInside.id = "statusInside";

    if (notification > 0) {
        var chatNewMessageCount = document.createElement('p');
        chatNewMessageCount.id = "chatNewMessageCount";
        chatNewMessageCount.appendChild(document.createTextNode(notification));
    }

    var chatLastModified = document.createElement('p');
    chatLastModified.id = "chatLastModified";

    chatLastModified.appendChild(document.createTextNode(lastAt));

    if (notification > 0) {
        statusInside.appendChild(chatNewMessageCount);
    }
    statusInside.appendChild(chatLastModified);
    status.appendChild(statusInside);

    chatItem.appendChild(picture);
    chatItem.appendChild(details);
    chatItem.appendChild(status);

    chatItem.addEventListener('click', (e) => {
        e.preventDefault();
        setSelectedChat({
            id: chat.id,
            name: friend.name,
            email: friend.email,
            picture: friend.picture
        })
        openConversation(friend, 'openFromChatSection');
    });

    document.getElementById('chatsDiv').appendChild(chatItem);
}

/************************************ CONVERSATION SECTION ******************************************/
sendBtn.addEventListener('click', function (e) {
    e.preventDefault();
    const { name, id } = getCurrentUserData()
    if (sendMessageInput.value) {
        sendBtn.disabled = true;
        var message = sendMessageInput.value;
        sendMessage({
            message: message,
            type: "sent",
            senderName: name,
            senderId: id,
        });
        resetSendDiv();
    }
});

fileInput.addEventListener('input', (event) => {
    event.preventDefault();
    var file = event.target.files[0];
    // Check if the file is an image.
    if (!file.type.match('image.*')) {
        alert('You can only share images');
        resetSendDiv();
        return;
    } else {
        renderImage("./image/imageSkeleton.png", "uploading", getCurrentUserData().name)
        uploadImage(file)
    }
});
function resetSendDiv() {
    if (sendMessageInput.value) {
        sendBtn.disabled = false;
        sendMessageInput.value = "";
        fileInput.value = "";
    }
}

async function sendMessage(data) {
    // Send to firestore database
    const { message, type, senderName, senderId } = data
    const { picture
    } = getCurrentUserData();
    addDocument('messages', {
        text: message,
        senderId: senderId,
        senderName: senderName,
        picture: picture,
        conversationId: getSelectedChat().id,
        createAt: serverTimestamp(),
    })

}
function renderMessage(message, type, sender) {
    var messageDiv = document.createElement('div');
    messageDiv.classList.add("message");

    var senderSpan = document.createElement('span');
    var messageBody = document.createElement('p');

    if (type == "sent") {
        senderSpan.classList.add("sender");
        messageBody.classList.add("senderMessageBody");
    } else {
        senderSpan.classList.add("receiver");
        messageBody.classList.add("receiverMessageBody");
    }

    senderSpan.appendChild(document.createTextNode(sender));
    var br = document.createElement('br');

    // HANDLING LINKS
    if (message.indexOf("https://") >= 0) {
        var text = "", link = "";
        var i;

        for (i = 0; i < message.indexOf("https://"); i++) {
            text += message[i];
        }
        if (text) {
            var text1 = document.createTextNode(text);
            messageBody.appendChild(text1);
        }

        for (i = message.indexOf("https://"); i < message.length; i++) {
            link += message[i];
            if (message[i + 1] == " ") {
                break;
            }
        }
        var linkText = document.createTextNode(link);
        var anchor = document.createElement('a');
        anchor.href = link;
        anchor.style.color = "blue";
        anchor.style.textDecoration = "underline";
        anchor.target = "_blank";
        anchor.append(linkText);

        messageBody.appendChild(anchor);

        text = "";
        for (++i; i < message.length; i++) {
            text += message[i];
        }
        if (text) {
            var text2 = document.createTextNode(text);
            messageBody.appendChild(text2);
        }
    }
    // HANDLING NORMAL TEXT
    else {
        messageBody.appendChild(document.createTextNode(message));
    }

    messageDiv.appendChild(senderSpan);
    messageDiv.appendChild(br);
    messageDiv.appendChild(messageBody);

    $("#messagesDiv").appendChild(messageDiv);
    $("#messagesDiv").scrollTop = $("#messagesDiv").scrollHeight;
}

function renderImage(path, type, sender) {
    var messageDiv = document.createElement('div');
    messageDiv.classList.add("imageMessage");

    var senderSpan = document.createElement('span');

    var img = document.createElement('img');
    img.src = path;

    // var bar = document.createElement('div')
    // bar.classList.add('uploading')
    // var process = document.createElement('div')
    // process.classList.add('process')
    // bar.appendChild(process)

    if (type == "sent") {
        senderSpan.classList.add("sender");
        img.classList.add("senderImgBody");
    } else {
        senderSpan.classList.add("receiver");
        img.classList.add("receiverImgBody");
    }

    senderSpan.appendChild(document.createTextNode(sender));

    var messageImageSpan = document.createElement('span');
    messageImageSpan.classList.add("imageBody");
    messageImageSpan.appendChild(img);

    messageDiv.appendChild(senderSpan);
    var brDiv = document.createElement('br');
    messageDiv.appendChild(brDiv);
    messageDiv.appendChild(messageImageSpan);

    if (type == "uploading") {
        img.classList.add('imgBlur')
        messageDiv.classList.add('uploading')
        // messageDiv.appendChild(bar);
    }

    document.querySelector("#messagesDiv").appendChild(messageDiv);
    document.querySelector("#messagesDiv").scrollTop = document.querySelector("#messagesDiv").scrollHeight;
}
async function openConversation(friend, type) {
    const { id, name, email, picture } = friend
    const currentUserId = getCurrentUserData().id
    groupsBtn.parentElement.classList.remove('active');
    friendsBtn.parentElement.classList.remove('active');
    peopleBtn.parentElement.classList.remove('active');
    chatsBtn.parentElement.classList.add('active');

    chats.classList.add('hide');
    groups.classList.add('hide');
    friends.classList.add('hide');
    people.classList.add('hide');
    conversations.classList.remove('hide');

    document.getElementById('conversationTitle').innerHTML = name;
    document.querySelector('.avata-chat-with').src = picture;
    document.querySelector("#messagesDiv").innerHTML = "";
    chatOn = true;
    if (unSubcribeMessage)
        unSubcribeMessage();
    subCribeMessageDb()
}
async function subCribeMessageDb() {
    const { id, name } = getCurrentUserData();
    const selectedChatid = getSelectedChat().id;
    let db = getFirestore();
    const q = query(collection(db, "messages"), where('conversationId', '==', selectedChatid), orderBy('createAt'), limit(30));
    unSubcribeMessage = onSnapshot(q, (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const { text, createAt, senderId } = change.doc.data();
                if (senderId === id) {
                    text ? renderMessage(text, 'receiver', name) : renderImage(change.doc.data().imgURL, 'receiver', name)
                } else {
                    text ? renderMessage(text, 'sent', name) : renderImage(change.doc.data().imgURL, 'sent', name)
                }
            }
        });
    });
}
function clearMessages() {
    const messagesDiv = document.getElementById("messagesDiv");
    while (messagesDiv.firstChild) {
        messagesDiv.removeChild(messagesDiv.lastElementChild);
    }
}