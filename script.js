"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];
let expelledStudents = [];
let sortedList = [];
let halfBloodFamilies = [];
let pureBloodFamilies = [];
let prefectArray = [];

let systemWasHacked = false;

// The prototype for all students:
const Student = {
  firstName: "",
  middleName: undefined,
  lastName: "no last name provided",
  nickName: undefined,
  gender: "unknown",
  photo: "photo unavailable",
  house: "not assigned to any house",
  expelled: "no",
  bloodstatus: "unknown",
  prefect: "no",
  inqmember: "no",
};

const settings = {
  filter: "all",
  filterProperty: "house",
  sortBy: "name",
  sortDir: "asc",
  chosenValue: "",
};

function start() {
  console.log("ready");
  loadJSON(
    "https://petlatkea.dk/2020/hogwarts/families.json",
    prepareBloodArrays
  );
  loadJSON("https://petlatkea.dk/2020/hogwarts/students.json", prepareObjects);
  //make sure that both json files are loaded before going any further - weell that did not go well,
}

//load json file
function loadJSON(url, prepare) {
  fetch(url)
    .then((response) => response.json())
    .then((jsonData) => {
      // when loaded, prepare objects
      prepare(jsonData);
    });
}

//delegator for next functions
function prepareObjects(jsonData) {
  allStudents = jsonData.map(prepareObject);

  displayList(allStudents);
  getFilterButtons();
  getSortButtons();
  searchListener();
  countStudents();
}

//store data about families bloodline
function prepareBloodArrays(jsonData) {
  pureBloodFamilies = jsonData.pure;
  halfBloodFamilies = jsonData.half;
  console.log(halfBloodFamilies);
}

function prepareObject(jsonObject) {
  jsonObject.fullname = jsonObject.fullname.toLowerCase().trim();

  //if the name includes a hyphen, capitalize first letter after the hyphen
  if (jsonObject.fullname.includes("-")) {
    jsonObject.fullname =
      jsonObject.fullname.slice(0, jsonObject.fullname.indexOf("-") + 1) +
      jsonObject.fullname
        .charAt(jsonObject.fullname.indexOf("-") + 1)
        .toUpperCase() +
      jsonObject.fullname.slice(jsonObject.fullname.indexOf("-") + 2);
  }

  //set house name to lower case
  jsonObject.house = jsonObject.house.toLowerCase().trim();

  //capitalize first letter of the house name
  jsonObject.house =
    jsonObject.house.charAt(0).toUpperCase() + jsonObject.house.slice(1);

  //split the strings from fullname
  const separateName = jsonObject.fullname.split(" ");

  //capitalize first letter of each string (first name, last name, middle name or nickname)
  separateName.forEach((nameString) => {
    if (nameString.charAt(0) == '"') {
      separateName[separateName.indexOf(nameString)] =
        '"' +
        nameString.charAt(1).toUpperCase() +
        nameString.slice(2, nameString.length - 1);
    } else {
      separateName[separateName.indexOf(nameString)] =
        nameString.charAt(0).toUpperCase() + nameString.slice(1);
    }
  });

  //create new object
  const oneStudent = Object.create(Student);

  //set the student's first name
  oneStudent.firstName = separateName[0];

  //set the last name, middle name and nickname
  if (separateName.length == 3) {
    if (separateName[1].charAt(0) == '"') {
      oneStudent.nickName = separateName[1].slice(1);
      oneStudent.middleName = undefined;
    } else {
      oneStudent.middleName = separateName[1];
    }
    oneStudent.lastName = separateName[2];
  } else {
    oneStudent.middleName = undefined;
    oneStudent.lastName = separateName[1];
  }
  oneStudent.house = jsonObject.house;

  //set the gender

  oneStudent.gender = jsonObject.gender;

  //set the photo url
  if (oneStudent.lastName && oneStudent.lastName.includes("-")) {
    const dividedLastName = oneStudent.lastName.split("-");
    oneStudent.photo =
      "photos/" +
      dividedLastName[1].toLowerCase() +
      "_" +
      oneStudent.firstName.charAt(0).toLowerCase() +
      ".png";
  } else if (oneStudent.lastName && oneStudent.lastName !== "Patil") {
    oneStudent.photo =
      "photos/" +
      oneStudent.lastName.toLowerCase() +
      "_" +
      oneStudent.firstName.charAt(0).toLowerCase() +
      ".png";
  } else if (oneStudent.lastName === "Patil") {
    oneStudent.photo =
      "photos/" +
      oneStudent.lastName.toLowerCase() +
      "_" +
      oneStudent.firstName.toLowerCase() +
      ".png";
  } else {
    oneStudent.photo = "photos/leanne.jpg";
  }

  if (halfBloodFamilies.includes(oneStudent.lastName) == true) {
    oneStudent.bloodstatus = "halfblood";
  } else if (pureBloodFamilies.includes(oneStudent.lastName) == true) {
    oneStudent.bloodstatus = "pureblood";
  } else {
    oneStudent.bloodstatus = "muggleblood";
  }
  console.log(oneStudent.bloodstatus);
  allStudents.push(oneStudent);
  //determineBloodStatus(oneStudent);
  return oneStudent;
}

function buildListofStudents(allStudents) {
  const currentList = filterList(allStudents);
  sortedList = sortList(currentList);
  displayList(sortedList);
  countStudents();
}

function displayList(students) {
  console.log(students);
  // clear the list
  document.querySelector(".allstudents").innerHTML = "";

  // build a new list
  students.forEach(displayStudent);
}

function displayStudent(student) {
  // create clone
  const clone = document
    .querySelector("#studenttemplate")
    .content.cloneNode(true);

  // set clone data
  if (student.middleName) {
    clone.querySelector(".name").textContent = clone.querySelector(
      ".name"
    ).textContent =
      student.firstName + " " + student.middleName + " " + student.lastName;
  } else if (student.nickName) {
    clone.querySelector(".name").textContent = clone.querySelector(
      ".name"
    ).textContent =
      student.firstName + " " + student.nickName + " " + student.lastName;
  } else if (student.lastName == undefined) {
    clone.querySelector(".name").textContent = student.firstName;
  } else {
    clone.querySelector(".name").textContent =
      student.firstName + " " + student.lastName;
  }
  /* if (student.lastName) {
    clone.querySelector(".name").textContent =
      student.firstName + " " + student.lastName;
  } else {
    clone.querySelector(".name").textContent = student.firstName;
  } */
  if (student.middleName) {
    clone.querySelector(
      ".popupwrap .namepopup"
    ).textContent = clone.querySelector(".name").textContent =
      student.firstName + " " + student.middleName + " " + student.lastName;
  } else if (student.nickName) {
    clone.querySelector(".namepopup").textContent = clone.querySelector(
      ".namepopup"
    ).textContent =
      student.firstName + " " + student.nickName + " " + student.lastName;
  } else if (student.lastName == undefined) {
    clone.querySelector(".namepopup").textContent = student.firstName;
  } else {
    clone.querySelector(".namepopup").textContent =
      student.firstName + " " + student.lastName;
  }
  clone.querySelector(".studentimage").src = student.photo;
  clone.querySelector(".studentimagepopup").src = student.photo;

  //add event listener to confirm button that allows to perform actions on students
  const confirmButton = clone.querySelector(".confirm");
  confirmButton.addEventListener("click", processDropdownInput);

  //check the value chosen in a dropdown
  const dropDown = clone.querySelector("#actiondropdown");
  function processDropdownInput() {
    settings.chosenValue = dropDown.value;
    console.log(settings.chosenValue);
    performAnAction(student);
  }
  createButton(clone);
  popUpOpenAndClose(clone);
  setStudentHouseBackground(clone, student);
  addStyling(student, clone);
  addIcons(student, clone);

  // append clone to list
  document.querySelector(".allstudents").appendChild(clone);
}

//create buttons for opening popup
function createButton(clone) {
  const popUpButton = document.createElement("button");
  popUpButton.textContent = "Details";
  popUpButton.classList.add("readmore");
  clone.querySelector(".onestudent .studentwrapper").appendChild(popUpButton);
}

//open and close popup with detailed student info
function popUpOpenAndClose(clone) {
  // functions to open and close popup, based on https://www.w3schools.com/howto/howto_css_modals.asp
  const popUpButton = clone.querySelector(".readmore");
  const popUpBox = clone.querySelector(".popup");
  popUpButton.addEventListener("click", function () {
    if (popUpBox.style.display === "block") {
      popUpBox.style.display = "none";
      popUpBox.classList.add("fade-out");
    } else {
      popUpBox.style.display = "block";
      popUpBox.classList.remove("fade-out");
      popUpBox.classList.add("fade-in");
    }
  });

  window.addEventListener("click", function (event) {
    if (event.target == popUpBox) {
      setTimeout(function () {
        popUpBox.style.display = "none";
      }, 400);
      popUpBox.classList.add("fade-out");
      popUpBox.classList.remove("fade-in");
    }
  });
}

//set the background for student based on their house
function setStudentHouseBackground(clone, student) {
  clone.querySelector(".housebackground").style.backgroundImage =
    "url(mainimages/" + student.house.toLowerCase() + "small.jpg)";
  clone.querySelector(".housebackgroundpopup").style.backgroundImage =
    "url(mainimages/" + student.house.toLowerCase() + ".jpg)";
}

//add relevant house styling
function addStyling(student, clone) {
  const dropdownHeading = clone.querySelector(".actions p");
  const popupName = clone.querySelector(".namepopup");
  const popupButton = clone.querySelector(".confirm");
  const houseLowercase = student.house.toLowerCase();

  dropdownHeading.classList.add(houseLowercase);
  popupName.classList.add(houseLowercase);
  popupButton.classList.add(houseLowercase);
}

//filtering and sorting

//add event listener to all filter buttons
function getFilterButtons() {
  document
    .querySelectorAll(".filterbutton")
    .forEach((button) => button.addEventListener("click", getFilterBy));
}

//add event listener to all sort buttons
function getSortButtons() {
  document
    .querySelectorAll(".sortbutton")
    .forEach((button) => button.addEventListener("click", getSortBy));
}

//get filter property and value
function getFilterBy(event) {
  document
    .querySelectorAll(".filterbutton")
    .forEach((button) => button.classList.remove("active"));
  const filter = event.target.dataset.filter;
  const filterProp = event.target.dataset.filterProperty;
  event.target.classList.add("active");
  setFilter(filter, filterProp);
}

//store filter property and value globally
function setFilter(filter, filterProp) {
  settings.filterBy = filter;
  settings.filterProperty = filterProp;
  console.log(filterProp);
  buildListofStudents();
}

//filter the students
function filterList(filteredList) {
  if (settings.filterBy == "*") {
    filteredList = allStudents;
  } else if (
    settings.filterBy !== undefined &&
    settings.filterProperty !== "expelled"
  ) {
    filteredList = allStudents.filter(
      (student) => student[settings.filterProperty] === settings.filterBy
    );
  } else if (
    settings.filterProperty === "expelled" &&
    settings.filterBy === "yes"
  ) {
    filteredList = expelledStudents;
  } else {
    filteredList = allStudents;
  }

  if (filteredList.length === 0) {
    document.querySelector(".nomatch").classList.remove("hide");
  } else {
    document.querySelector(".nomatch").classList.add("hide");
  }

  //console.log(filteredList);
  return filteredList;
}

//get sorting property and direction
function getSortBy(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;
  document
    .querySelectorAll(".sortbutton")
    .forEach((button) => button.classList.remove("active"));
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
    event.target.querySelector("span").textContent = " (a-z)";
  } else {
    event.target.dataset.sortDirection = "asc";
    event.target.querySelector("span").textContent = "(z-a)";
  }
  event.target.classList.add("active");

  setSort(sortBy, sortDir);
}

//store filter sorting property and direction globally, toggle the direction
function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildListofStudents();
}

//sort the students
function sortList(sortedList) {
  if (settings.sortDir == "asc") {
    sortedList = sortedList.sort(sortAsc);
    function sortAsc(a, b) {
      if (a[settings.sortBy] < b[settings.sortBy]) {
        return -1;
      } else {
        return 1;
      }
    }
  } else {
    sortedList = sortedList.sort(sortDesc);
    function sortDesc(a, b) {
      if (a[settings.sortBy] > b[settings.sortBy]) {
        return -1;
      } else {
        return 1;
      }
    }
  }
  //console.log(sortedList);
  return sortedList;
}

//add relevant icons to student popup
function addIcons(student, clone) {
  console.log("icons");
  if (student.expelled == "yes") {
    clone.querySelector(".notexpelled").style.display = "none";
    clone.querySelector(".expelled").style.display = "inline-block";
  } else if (student.expelled == "no") {
    clone.querySelector(".notexpelled").style.display = "inline-block";
    clone.querySelector(".expelled").style.display = "none";
  }
  if (student.prefect == "yes") {
    clone.querySelector(".prefect").style.display = "inline-block";
    clone.querySelector(".notprefect").style.display = "none";
  } else if (student.prefect == "no") {
    clone.querySelector(".prefect").style.display = "none";
    clone.querySelector(".notprefect").style.display = "inline-block";
  }
  if (student.bloodstatus == "pureblood") {
    clone.querySelector(".halfblood").style.display = "none";
    clone.querySelector(".muggleblood").style.display = "none";
    clone.querySelector(".pureblood").style.display = "inline-block";
  } else if (student.bloodstatus == "halfblood") {
    clone.querySelector(".halfblood").style.display = "inline-block";
    clone.querySelector(".muggleblood").style.display = "none";
    clone.querySelector(".pureblood").style.display = "none";
  } else if (student.bloodstatus == "muggleblood") {
    clone.querySelector(".halfblood").style.display = "none";
    clone.querySelector(".muggleblood").style.display = "inline-block";
    clone.querySelector(".pureblood").style.display = "none";
  }
  if (student.inqmember == "yes") {
    clone.querySelector(".inqsquad").style.display = "inline-block";
    clone.querySelector(".notinqsquad").style.display = "none";
  } else if (student.inqmember == "no") {
    clone.querySelector(".inqsquad").style.display = "none";
    clone.querySelector(".notinqsquad").style.display = "inline-block";
  }
}

//set the chosen value from dropdown as global variable
function checkSelectedOption(event) {
  settings.chosenValue = event.target.value;
  console.log(settings.chosenValue);
}

//check which action was chosen and call appropriate function
function performAnAction(student) {
  switch (settings.chosenValue) {
    case "expel":
      expelTheStudent(student);
      break;
    case "makeprefect":
      makeOrRevokePrefect(student);
      break;
    case "revokeprefect":
      makeOrRevokePrefect(student);
      break;
    case "addinquisition":
      addInqMember(student);
      break;
    case "removeinquisition":
      removeInqMember(student);
      break;
  }
  buildListofStudents();
}

//expelling a student
function expelTheStudent(student) {
  const expelInfo = document.querySelector(".actioninfo");
  const expelInfoContent = document.querySelector(".actioninfo .infocontent");
  if (student.lastName == "Jankowska") {
    expelInfoContent.textContent =
      "NO! This student CAN NOT be expelled. Try this one more time and you'll get eaten by a troll.";
    expelInfoContent.classList.add("warning");
    expelInfo.classList.add("vibrate-1");
    document.body.classList.add("flicker-1");
    expelInfo.style.display = "block";
  } else {
    const indexOfStudent = allStudents.indexOf(student);
    const expelledStudent = allStudents.splice(indexOfStudent, 1);
    expelledStudent[0].expelled = "yes";
    expelInfoContent.textContent =
      student.firstName + " is now expelled from Hogwarts.";
    expelInfo.style.display = "block";
    console.log(expelledStudent[0].bloodstatus);
    expelledStudents.push(expelledStudent[0]);
  }
}

//appointing or removing a prefect
function makeOrRevokePrefect(student) {
  const prefInfo = document.querySelector(".actioninfo");
  const prefInfoContent = document.querySelector(".actioninfo .infocontent");
  const studentHouse = student.house;
  let prefectHouseArray = prefectArray.filter(
    (student) => student.house === studentHouse
  );
  if (settings.chosenValue === "makeprefect") {
    if (student.prefect == "yes") {
      prefInfoContent.textContent = "This student is already a prefect.";
      prefInfo.style.display = "block";
    } else if (prefectHouseArray.length < 2 && student.prefect == "no") {
      student.prefect = "yes";
      prefInfoContent.textContent = student.firstName + " is now a prefect!";
      prefInfo.style.display = "block";
      prefectArray.push(student);
      prefectHouseArray = prefectArray.filter(
        (student) => student.house === studentHouse
      );
      console.log(prefectHouseArray);
    } else if (prefectHouseArray.length == 2 && student.prefect == "no") {
      console.log(prefectHouseArray);
      console.log("you cant do this");
      prefInfoContent.textContent =
        "Only two students from each house can be prefects. If you wish to appoint a new one, you must revoke other student's prefect status first.";
      prefInfo.style.display = "block";
    }
  }
  if (settings.chosenValue === "revokeprefect") {
    if (student.prefect == "no") {
      prefInfoContent.textContent = "This student is not a prefect.";
      prefInfo.style.display = "block";
    } else if (student.prefect == "yes") {
      student.prefect = "no";
      prefInfoContent.textContent =
        student.firstName + " is now removed as a prefect!";
      prefInfo.style.display = "block";
      const indexOfStudent = prefectArray.indexOf(student);
      prefectArray.splice(indexOfStudent, 1);
      console.log(prefectArray);
    }
  }
}

//adding members to inquisitorial swuad
function addInqMember(student) {
  const inqInfo = document.querySelector(".actioninfo");
  const inqInfoContent = document.querySelector(".actioninfo .infocontent");
  if (
    (student.house == "Slytherin" || student.bloodstatus == "pureblood") &&
    student.inqmember == "no"
  ) {
    student.inqmember = "yes";
    inqInfoContent.textContent =
      student.firstName + " is now a member of inquisitorial squad!";
    inqInfo.style.display = "block";
    if (systemWasHacked) {
      setTimeout(hackRemoveInq, 2000, student);
    }
  } else if (student.bloodstatus !== "pureblood") {
    inqInfoContent.textContent =
      "Only pureblood or Slytherin students can be members of inquisitorial squad.";
    inqInfo.style.display = "block";
  } else if (student.inqmember == "yes") {
    inqInfoContent.textContent =
      "This student is already a member of inquisitorial squad.";
    inqInfo.style.display = "block";
  }
}

//removing members from inq squad
function removeInqMember(student) {
  const inqInfo = document.querySelector(".actioninfo");
  const inqInfoContent = document.querySelector(".actioninfo .infocontent");
  if (student.inqmember == "no") {
    inqInfoContent.textContent =
      "This student is not a member of inquisitorial squad.";
    inqInfo.style.display = "block";
  } else if (student.inqmember == "yes") {
    student.inqmember = "no";
    inqInfoContent.textContent =
      student.firstName + " is now removed from inquisitorial squad!";
    inqInfo.style.display = "block";
  }
}

//when system is hacked, remove students from inq squad
function hackRemoveInq(student) {
  const inqInfo = document.querySelector(".actioninfo");
  const inqInfoContent = document.querySelector(".actioninfo .infocontent");
  //const evilLaughAudio = new Audio("sound/evillaugh.mp3");
  student.inqmember = "no";
  inqInfoContent.textContent =
    student.firstName + " is no longer in inquisitorial squad MUAHAHAHA";
  inqInfoContent.classList.add("warning");
  inqInfo.classList.add("vibrate-1");
  inqInfo.style.display = "block";
  document.body.classList.add("flicker-1");
  displayList(allStudents);
}

// close the popup with info about appointing prefects
(function () {
  const infoContent = document.querySelector(".actioninfo .infocontent");
  const prefInfo = document.querySelector(".actioninfo");
  window.addEventListener("click", function (event) {
    if (event.target == prefInfo) {
      prefInfo.style.display = "none";
      infoContent.classList.remove("warning");
      prefInfo.classList.remove("vibrate-1");
      document.body.classList.remove("flicker-1");
    }
  });
})();

// call search function
function searchListener() {
  let searchStudents = allStudents;
  document
    .querySelector("#searchInput")
    .addEventListener("keyup", searchResults);
}

//search function for student names and lastnames
//this function waas inspired by https://www.w3schools.com/howto/howto_js_filter_lists.asp
//it isn't fully optimal as it only alters the view (hiding students that don't match requirements), but I couldn't make it work otherwise
function searchResults() {
  const filter = document.querySelector("#searchInput").value.toUpperCase();
  let searchStudents = document.querySelectorAll(".onestudent");
  for (let i = 0; i < searchStudents.length; i++) {
    let studentName = searchStudents[i]
      .querySelector(".name")
      .textContent.toUpperCase();
    if (studentName.indexOf(filter) > -1) {
      searchStudents[i].style.display = "block";
      searchStudents[i].classList.remove("notvisible");
    } else {
      searchStudents[i].style.display = "none";
      searchStudents[i].classList.add("notvisible");
    }
  }
  if (document.querySelectorAll(".notvisible").length === allStudents.length) {
    document.querySelector(".nomatch").classList.remove("hide");
  } else {
    document.querySelector(".nomatch").classList.add("hide");
  }
  countStudents();
}

//count students (displayed, expelled, from specific houses)
function countStudents() {
  let numberOfExpelled = expelledStudents.length;
  let numberOfAll = allStudents.length;
  let gryffindorNumber = allStudents.filter(
    (student) => student.house === "Gryffindor"
  ).length;
  let slytherinNumber = allStudents.filter(
    (student) => student.house === "Slytherin"
  ).length;
  let hufflepuffNumber = allStudents.filter(
    (student) => student.house === "Hufflepuff"
  ).length;
  let ravenclawNumber = allStudents.filter(
    (student) => student.house === "Ravenclaw"
  ).length;
  let numberOfDisplayed =
    document.querySelectorAll(".onestudent").length -
    document.querySelectorAll(".notvisible").length;

  console.log(document.querySelectorAll(".onestudent").length);
  document.querySelector(".numberall span").textContent = numberOfAll;
  document.querySelector(".numberexpelled span").textContent = numberOfExpelled;
  document.querySelector(".numbervisible span").textContent = numberOfDisplayed;
  document.querySelector(
    ".numbergryffindor span"
  ).textContent = gryffindorNumber;
  document.querySelector(
    ".numberhufflepuff span"
  ).textContent = hufflepuffNumber;
  document.querySelector(".numberravenclaw span").textContent = ravenclawNumber;
  document.querySelector(".numberslytherin span").textContent = slytherinNumber;
}

//check pressed keys - call hack the system at appropriate sequence
(function () {
  let sequence = [];

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    sequence.push(key);
    let sequenceString = sequence.join("");
    if (sequenceString === "magic") {
      hackTheSystem();
    }
  });
})();

//hacking the system
//setTimeout(hackTheSystem, 1000);
function hackTheSystem() {
  if (systemWasHacked === false) {
    systemWasHacked = true;

    const infoContent = document.querySelector(".actioninfo .infocontent");
    const prefInfo = document.querySelector(".actioninfo");
    infoContent.textContent = "The system was hacked. NOW IT BELONGS TO MEEE";
    infoContent.classList.add("warning");
    document.body.classList.add("flicker-1");
    prefInfo.classList.add("vibrate-1");
    prefInfo.style.display = "block";
    // injecting myself into list of students
    const oneStudent = Object.create(Student);
    oneStudent.firstName = "Marcelina";
    oneStudent.lastName = "Jankowska";
    oneStudent.house = "Hufflepuff";
    oneStudent.gender = "girl";
    oneStudent.photo = "photos/jankowska_m.png";
    allStudents.push(oneStudent);

    // ruining bloodstatus algorithm (or rather randomizing)
    allStudents.forEach((student) => {
      if (student.bloodstatus === "pureblood") {
        const bloodValues = ["pureblood", "halfblood", "muggleblood"];
        student.bloodstatus =
          bloodValues[Math.floor(Math.random() * bloodValues.length)];
      } else {
        student.bloodstatus = "pureblood";
      }
    });
    displayList(allStudents);
    countStudents();
  } else {
    console.log("system can be only hacked once");
  }
}
