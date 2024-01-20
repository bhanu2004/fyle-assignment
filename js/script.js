// $('selector').action();

let PAGE_NO = 1;
let REPO_PER_PAGE=10;
let PAGE_COUNT = 0;
let REPO_COUNT=0;
let CURR_PAGE=1;
let PAGE_START=1;
let PAGE_END=2;
let NAME = "No User";
$('#previous_btn').click(function(){
    PAGE_NO = PAGE_NO-1;
    updatePageUsingBtn();
})

$('#next_btn').click(function(){
    PAGE_NO = PAGE_NO+1;
    updatePageUsingBtn();
})

$('#first_page').click(function(){
    PAGE_NO = 1;
    updatePageUsingBtn();
})

$('#last_page').click(function(){ 
    PAGE_NO = PAGE_COUNT;
    updatePageUsingBtn();
})

$('#repo_per_page').change(function(){
    REPO_PER_PAGE = $(this).val();
    PAGE_NO=1;
    updatePagination();
    fetchRepo();
    // updateRepo();
})
$('#search_btn').click(function(){
    let name = $('#user_input').val();
    NAME = name;
    fetchFullData();
})
function fetchFullData(){
    fetchUserInfo();
    checkDisable();
    fetchRepo();

}
function updatePageUsingBtn(){
    $(".active")[0].classList.remove("active");  
    updatePagination();
    checkDisable();
    fetchRepo();
    // updateRepo();
}

function checkDisable(){
    if(PAGE_NO==PAGE_COUNT){
        $('#next_btn').attr("disabled", "disabled");
    }
    if(PAGE_NO!=1){
        $('#previous_btn').removeAttr("disabled");
    }
    if(PAGE_NO==1){
        $('#previous_btn').attr("disabled", "disabled");
    }
    if(PAGE_NO!=PAGE_COUNT){
        $('#next_btn').removeAttr("disabled");
    }
}

async function fetchUserInfo() {
    $('.header')[0].classList.add("hidden");
    $('.loading_header')[0].classList.remove("hidden");
    
    let response = await fetch(`https://api.github.com/users/${NAME}`);
    let data = await response.json();
    $('.information').empty();
 

    let name = document.createElement("h2");
    name.id = "name";
    if(data.message=='Not Found'){
        name.textContent = "Invalid User";
        $('.information')[0].append(name); 
        $('.header')[0].classList.remove("hidden");
        $('.loading_header')[0].classList.add("hidden");
        $('#profile').attr("src", "./image/default_profile.jpg");
        REPO_COUNT=0;
        $('#github__link__text').text(`https://github.com/#`)
        $('#github__link').attr('href', '/');
        $('#github__link').removeAttr('target');
        // $('#github__link').remove();
        return;
    }
    if(data.name){
        name.textContent = data.name;
    }
    else name.textContent = `@${data.login}`;
    $('.information')[0].append(name);
    

    // if(data.location) $('#location').text(data.location);
    // else $('.location')[0].remove();
    

    // <p id="bio"></p>
    if(data.bio){
        let bio = document.createElement("p");
        bio.id = "bio";
        bio.textContent = data.bio;
        $('.information')[0].append(bio);
    }
    if(data.location){
        let location = document.createElement("p");
        location.classList.add('location');
        let locationIcon = document.createElement("img");
        locationIcon.classList.add("icon");
        locationIcon.src = "./image/map.png"

        let span = document.createElement("span");
        span.id = "location";
        span.textContent = data.location;

        location.append(locationIcon);
        location.append(span);
        $('.information')[0].append(location);
    }

    $('#profile').attr("src", data.avatar_url);
    $('#github__link__text').text(`https://github.com/${data.login}`)
    $('#github__link').attr('href', `https://github.com/${data.login}`);
    $('#github__link').attr('target', '_blank');

    REPO_COUNT = data.public_repos;

    $('.header')[0].classList.remove("hidden");
    $('.loading_header')[0].classList.add("hidden");

    // fetch and update links
    let linkResponse = await fetch(`https://api.github.com/users/${NAME}/social_accounts`);
    let linkData = await linkResponse.json();
    let linkDiv = document.createElement('div');
    linkDiv.id = 'social__accounts';
    linkData.map((item)=>{
        var paragraph = document.createElement("p");
        var span = document.createElement("span");
        span.textContent = `${item.provider}: `;
        var a = document.createElement("a");
        a.textContent =item.url;
        a.href = item.url;
        a.target = '_blank';
        paragraph.append(span);
        paragraph.append(a);
        // paragraph.textContent = `${item.provider}:<a href=${item.url}>${item.url}</a>`;
        linkDiv.append(paragraph);
    }) 
    $('.information')[0].append(linkDiv);
}

function updatePagination(){
    PAGE_COUNT = Math.ceil(REPO_COUNT/REPO_PER_PAGE);
    console.log("check pagination",REPO_COUNT,PAGE_COUNT)
    if(PAGE_COUNT==0){
        $('.pagination')[0].classList.add('hidden');
        return;
    }
    else{
        $('.pagination')[0].classList.remove('hidden');
    }
    
    // PAGE_END = Math.min(PAGE_COUNT,9);

    const page_numbers = $('.page__numbers');
    page_numbers.empty();

    // updating 'page start' and 'page end' of pagination
    if(PAGE_NO-PAGE_START>4){
        PAGE_END = Math.min(PAGE_COUNT,PAGE_NO+4);
        PAGE_START = Math.max(1,PAGE_END-8);
    }
    else if(PAGE_NO-PAGE_START<4){
        PAGE_START = Math.max(1,PAGE_NO-4);
        PAGE_END = Math.min(PAGE_COUNT,PAGE_START+8);
    }
    // if(PAGE_NO-PAGE_START==4){

    
    if(PAGE_START!=1){
        let singlePage = document.createElement("div");
        singlePage.classList.add('page');
        singlePage.textContent = '...';
        page_numbers.append(singlePage);
    }

    // inserting page numbers in the pagination
    for(let i=PAGE_START;i<=PAGE_END;i++){
        let singlePage = document.createElement("div");
        singlePage.classList.add('page');
        if(i==PAGE_NO){
            singlePage.classList.add('active');
        }
        singlePage.textContent = i;

        singlePage.addEventListener("click", ()=>{
            PAGE_NO=i;
            $(".active")[0].classList.remove("active");
            singlePage.classList.add("active");
            checkDisable();
            fetchRepo();
            // updatePagination();
            // updateRepo();
            
        });
        
        page_numbers.append(singlePage);
        checkDisable();
    }
    if(PAGE_END!=PAGE_COUNT){
        let singlePage = document.createElement("div");
        singlePage.classList.add('page');
        singlePage.textContent = '...';
        page_numbers.append(singlePage);
    }
}



async function fetchRepo(){
    $('.repository__container').empty();
    $('.load_repository_container')[0].classList.remove("hidden");
    let repoResponse = await fetch(`https://api.github.com/users/${NAME}/repos?per_page=${REPO_PER_PAGE}&page=${PAGE_NO}`);
    let repoData = await repoResponse.json();
    if(repoData.message=='Not Found'){
        $('.load_repository_container')[0].classList.add("hidden");
        PAGE_COUNT=0;
        updatePagination();
        return;
    }
    let repoDiv = $('.repository__container');
    
    
    repoData.map((item)=>{
        var singleRepo = document.createElement("div");
        singleRepo.classList.add('repository');

        var title = document.createElement("h2");
        title.classList.add('title');
        title.textContent = item.name;

        var desc = document.createElement("p");
        desc.classList.add('desc');
        desc.textContent = item.description;
        singleRepo.append(title)
        singleRepo.append(desc)


        // create repository divs
        var topicList = document.createElement("div");
        topicList.classList.add('topic__list');
        for(var i=0;i<item.topics.length;i++){
            var topicSpan = document.createElement("span");
            topicSpan.classList.add('topic');

            if(i==3 && item.topics.length>4){
                topicSpan.textContent = `${item.topics[i] } ${item.topics.length-4}+`;
                topicList.append(topicSpan);
                break;
            }
            topicSpan.textContent = item.topics[i];
            topicList.append(topicSpan);
        }

        singleRepo.append(topicList);
        repoDiv.append(singleRepo);
    })
    $('.load_repository_container')[0].classList.add("hidden");
    updatePagination();
}

// fetchFullData();