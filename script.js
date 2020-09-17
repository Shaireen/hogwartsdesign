"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];
let expelledStudents = [];
let sortedList = [];
let halfBloodFamilies = [];
let pureBloodFamilies = [];
let prefectArray = [];

// The prototype for all animals:
const Student = {
  firstName: "",
  middleName: undefined,
  lastName: "no last name provided",
  nickName: undefined,
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

  // TODO: Add event-listeners to filter and sort buttons
  loadJSON(
    "https://petlatkea.dk/2020/hogwarts/families.json",
    prepareBloodArrays
  );
  loadJSON("https://petlatkea.dk/2020/hogwarts/students.json", prepareObjects);
}

function loadJSON(url, prepare) {
  fetch(url)
    .then((response) => response.json())
    .then((jsonData) => {
      // when loaded, prepare objects
      prepare(jsonData);
    });
}

function prepareObjects(jsonData) {
  allStudents = jsonData.map(prepareObject);

  // TODO: This might not be the function we want to call first
  displayList(allStudents);
  //allStudents.forEach(addIcons);
  getFilterButtons();
  getSortButtons();
  searchListener();
  countStudents();
}

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

  // check the blood status of a student
  if (
    pureBloodFamilies.includes(oneStudent.lastName) == true &&
    halfBloodFamilies.includes(oneStudent.lastName) == true
  ) {
    oneStudent.bloodstatus = "halfblood";
  } else if (
    pureBloodFamilies.includes(oneStudent.lastName) == true &&
    halfBloodFamilies.includes(oneStudent.lastName) == false
  ) {
    oneStudent.bloodstatus = "pureblood";
  } else if (
    pureBloodFamilies.includes(oneStudent.lastName) == false &&
    halfBloodFamilies.includes(oneStudent.lastName) == true
  ) {
    oneStudent.bloodstatus = "halfblood";
  } else {
    oneStudent.bloodstatus = "muggleblood";
  }

  console.log(oneStudent.bloodstatus);
  return oneStudent;
}

//filtering and sorting

function getFilterButtons() {
  document
    .querySelectorAll(".filterbutton")
    .forEach((button) => button.addEventListener("click", getFilterBy));
}

function getSortButtons() {
  document
    .querySelectorAll(".sortbutton")
    .forEach((button) => button.addEventListener("click", getSortBy));
}

function getFilterBy(event) {
  const filter = event.target.dataset.filter;
  const filterProp = event.target.dataset.filterProperty;
  setFilter(filter, filterProp);
}

function setFilter(filter, filterProp) {
  settings.filterBy = filter;
  settings.filterProperty = filterProp;
  console.log(filterProp);
  buildListofStudents();
}

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

  //console.log(filteredList);
  return filteredList;
}

function getSortBy(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
    event.target.querySelector("span").textContent = " (a-z)";
  } else {
    event.target.dataset.sortDirection = "asc";
    event.target.querySelector("span").textContent = "(z-a)";
  }

  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildListofStudents();
}

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

function buildListofStudents(allStudents) {
  const currentList = filterList(allStudents);
  sortedList = sortList(currentList);
  displayList(sortedList);
  countStudents();
}

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

function displayList(students) {
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

function addStyling(student, clone) {
  const dropdownHeading = clone.querySelector(".actions p");
  const popupName = clone.querySelector(".namepopup");
  const popupButton = clone.querySelector(".confirm");
  const houseLowercase = student.house.toLowerCase();

  dropdownHeading.classList.add(houseLowercase);
  popupName.classList.add(houseLowercase);
  popupButton.classList.add(houseLowercase);
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
  closeInfo();
  buildListofStudents();
}

//expelling a student
function expelTheStudent(student) {
  const indexOfStudent = allStudents.indexOf(student);
  const expelledStudent = allStudents.splice(indexOfStudent, 1);
  expelledStudent[0].expelled = "yes";
  console.log(expelledStudent[0].bloodstatus);
  expelledStudents.push(expelledStudent[0]);
}

//appointing a prefect
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
      const indexOfStudent = prefectArray.indexOf(student);
      prefectArray.splice(indexOfStudent, 1);
      console.log(prefectArray);
    }
  }
}

function addInqMember(student) {
  const inqInfo = document.querySelector(".actioninfo");
  const inqInfoContent = document.querySelector(".actioninfo .infocontent");
  if (
    (student.house == "Slytherin" || student.bloodstatus == "pureblood") &&
    student.inqmember == "no"
  ) {
    student.inqmember = "yes";
  } else if (student.bloodstatus !== "pureblood") {
    inqInfoContent.textContent =
      "Only pureblood or Slytherin students can be members of inquisitorial squad";
    inqInfo.style.display = "block";
  } else if (student.inqmember == "yes") {
    inqInfoContent.textContent =
      "This student is already a member of inquisitorial squad";
    inqInfo.style.display = "block";
  }
}

function removeInqMember(student) {
  const inqInfo = document.querySelector(".actioninfo");
  const inqInfoContent = document.querySelector(".actioninfo .infocontent");
  if (student.inqmember == "no") {
    inqInfoContent.textContent =
      "This student is not a member of inquisitorial squad";
    inqInfo.style.display = "block";
  } else if (student.inqmember == "yes") {
    student.inqmember = "no";
  }
}

// close the popup with info about appointing prefects
function closeInfo() {
  const prefInfo = document.querySelector(".actioninfo");
  window.addEventListener("click", function (event) {
    if (event.target == prefInfo) {
      prefInfo.style.display = "none";
    }
  });
}

// call search function
function searchListener() {
  document
    .querySelector("#searchInput")
    .addEventListener("keyup", searchResults);
}

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
  countStudents();
}

function countStudents() {
  let numberOfExpelled = expelledStudents.length;
  let numberOrAll = allStudents.length;
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
}
