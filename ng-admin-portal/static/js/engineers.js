window.onload = function () {
  window.sessionStorage.setItem('faAdmin', JSON.stringify({"name": "Anil"}));
  if (window.sessionStorage.getItem('faAdmin')) {
    init();
    document.body.style.display = 'block';
  } else {
    window.location.href = "index.html";
  }
}

let init = function () {
  let faAdmin = JSON.parse(window.sessionStorage.getItem('faAdmin')),
      loggedInUser = document.getElementById('loggedInUser');

  loggedInUser.textContent = faAdmin.name || 'ADMIN';
  loggedInUser.parentNode.title = faAdmin.role || 'ADMIN';
  setupAddEngineersCard();
  setupResultsTable();
  // loadEngineersList();
}
let loadEngineersList = function () {
  displayLoading(document.body);
  let engineersContainer = document.querySelector('.engineers-container'),
      engineersListTableBody = engineersContainer.querySelector('table.engineer tbody'),
      tableRow = engineersContainer.querySelector('.table-row'),
      tableRowMsg = engineersContainer.querySelector('.table-row-msg');
  engineersListTableBody.innerHTML = '';
  tableRow.style.display = 'none';
  tableRowMsg.style.display = 'block';
  $.ajax({
    "url": "/GSMCServices/service/loginDetails/listOfEngineer",
    "method": "POST",
    "contentType": "application/json",
    "dataType": "json",
    "processData": false
  }).done(function (listOfEngineers) {
    doneLoading(document.body);
    if (listOfEngineers && listOfEngineers.length) {
      for (engineer of listOfEngineers) {
        let engineerDetails = engineer.engineerDetail;
        let newTr = document.createElement('tr');
        newTr.setAttribute('data-loginid', engineerDetails.loginId);
        newTr.setAttribute('data-role', 'ENGINEER');
        newTr.innerHTML = `<td>${engineerDetails.loginId}</td>
          <td>${engineerDetails.engineerName}</td>
          <td>${engineerDetails.location}</td>
          <td>${engineerDetails.partnerName}</td>
          <td><span class="glyphicon glyphicon-trash"></span></td>`;
        engineersListTableBody.appendChild(newTr);
      }
      tableRow.style.display = 'block';
      tableRowMsg.style.display = 'none';
    } else {
      console.log("INFO: No experts found");
      tableRow.style.display = 'none';
      tableRowMsg.textContent = "No Engineers found!!";
      tableRowMsg.style.display = 'block';
    }
  }).fail(function (err) {
    doneLoading(document.body);
    console.log("ERROR: ", err);
  });
}

let setupResultsTable = function () {
  let reslutsTable = document.querySelector('table'),
      reslutsTableBody = reslutsTable.querySelector('tbody'),
      selectAllCheckbox = reslutsTable.querySelector('thead .checkbox'),
      tableOperations = document.querySelector('.table-operations'),
      exportListIcon = tableOperations.querySelector('.glyphicon-export'),
      resetSelectedIcon = tableOperations.querySelector('.glyphicon-repeat'),
      deleteSelectedIcon = tableOperations.querySelector('.glyphicon-trash');

  selectAllCheckbox.addEventListener('click', function (evt) {
    let allCheckboxes = reslutsTableBody.getElementsByClassName('checkbox');
    if (evt.target.className.includes('unchecked')) {
      evt.target.className = 'checkbox glyphicon glyphicon-check';
      for (var i = 0; i < allCheckboxes.length; i++) {
        allCheckboxes[i].className = 'checkbox glyphicon glyphicon-check';
      }
      resetSelectedIcon.className = resetSelectedIcon.className.replace(/ *disabled */g,'');
      deleteSelectedIcon.className = deleteSelectedIcon.className.replace(/ *disabled */g,'');
    } else {
      evt.target.className = 'checkbox glyphicon glyphicon-unchecked';
      for (var i = 0; i < allCheckboxes.length; i++) {
        allCheckboxes[i].className = 'checkbox glyphicon glyphicon-unchecked';
      }
      resetSelectedIcon.className += ' disabled';
      deleteSelectedIcon.className += ' disabled';
    }
  });
  tableOperations.addEventListener('click', function (evt) {
    evt.stopPropagation();
    if (evt.target.className.includes('export')) {
      console.log('Export Engineers list');
      // TODO: Export logic
    } else if (evt.target.className.includes('trash')) {
      let allCheckboxes = reslutsTableBody.getElementsByClassName('checkbox'),
         loginIds = [];
      for (var i = 0; i < allCheckboxes.length; i++) {
       if (allCheckboxes[i].className.includes('-check')) {
         let $parentTr = $(allCheckboxes[i]).parents('tr');
         if ($parentTr[0]) {
           let loginId = $parentTr.attr('data-loginid');
           if (loginId) {
             loginIds.push(loginId);
           } else {
             console.log('Failed to retrieve Login Id for ' + loginId);
           }
         }
       }
      }
      let confirmStr = "Delete the Engineers with following Login Id(s):\n" + loginIds.join(', ');
      if (confirm(confirmStr)) {
        evt.target.className += ' disabled';
        $.ajax({
          "url": "/GSMCServices/service/loginDetails/deleteUserDetail",
          "method": "POST",
          "contentType": "application/json",
          "data": JSON.stringify({
            "loginIds": loginIds,
            "role": 'ENGINEER'
          }),
          "dataType": "json",
          "processData": false
        }).done(function (resp) {
          evt.target.className = evt.target.className.replace(/ *disabled */g,'');
          if (resp.result == "SUCCESS") {
            loadExpertsList();
            alert(resp.responseMessage);
          } else {
            console.log('ERROR: AJAX Delete User failed for ' + loginId);
          }
        }).fail(function (err) {
          evt.target.className = evt.target.className.replace(/ *disabled */g,'');
          console.log("ERROR: ", err);
        });
      }
    } else if (evt.target.className.includes('repeat')) {
      let allCheckboxes = reslutsTableBody.getElementsByClassName('checkbox'),
         loginIds = [];
      for (var i = 0; i < allCheckboxes.length; i++) {
       if (allCheckboxes[i].className.includes('-check')) {
         let $parentTr = $(allCheckboxes[i]).parents('tr');
         if ($parentTr[0]) {
           let loginId = $parentTr.attr('data-loginid');
           if (loginId) {
             loginIds.push(loginId);
           } else {
             console.log('Failed to retrieve Login Id for ' + loginId);
           }
         }
       }
      }
      let confirmStr = "Reset the Passwords for the following Login Id(s):\n " + loginIds.join(', ');
      if (confirm(confirmStr)) {
        evt.target.className += ' disabled';
        $.ajax({
          "url": "/GSMCServices/service/loginDetails/resetPassword",
          "method": "POST",
          "contentType": "application/json",
          "data": JSON.stringify({
            "loginIds": loginIds,
            "role": 'ENGINEER'
          }),
          "dataType": "json",
          "processData": false
        }).done(function (resp) {
          evt.target.className = evt.target.className.replace(/ *disabled */g,'');
          if (resp.result == "SUCCESS") {
            $parentTr.remove();
            alert(resp.responseMessage);
          } else {
            console.log('ERROR: AJAX Delete User failed for ' + loginId);
          }
        }).fail(function (err) {
          evt.target.className = evt.target.className.replace(/ *disabled */g,'');
          console.log("ERROR: ", err);
        });
      }
    }
  });
  reslutsTableBody.addEventListener('click', function (evt) {
    if (evt.target.className.includes('checkbox')) {
      let allCheckboxes = reslutsTableBody.getElementsByClassName('checkbox');
      if (evt.target.className.includes('unchecked')) {
        evt.target.className = 'checkbox glyphicon glyphicon-check';
      } else {
        evt.target.className = 'checkbox glyphicon glyphicon-unchecked';
      }
      let noOfCheckedRows = 0;
      for (var i = 0; i < allCheckboxes.length; i++) {
        if (allCheckboxes[i].className.includes('-check')) {
          noOfCheckedRows++;
        }
      }
      if(noOfCheckedRows){
        resetSelectedIcon.className = resetSelectedIcon.className.replace(/ *disabled */g,'');
        deleteSelectedIcon.className = deleteSelectedIcon.className.replace(/ *disabled */g,'');
        selectAllCheckbox.className = "checkbox glyphicon glyphicon-unchecked";
        if (noOfCheckedRows == allCheckboxes.length)
          selectAllCheckbox.className = "checkbox glyphicon glyphicon-check";
      } else {
        resetSelectedIcon.className += ' disabled';
        deleteSelectedIcon.className += ' disabled';
      }
    }
  });
};
let setupAddEngineersCard = function () {
  let addEngineerCard = document.querySelector('.card.add-user.engineer'),
      btnShowEngineerCard = document.querySelector('.btn-show-add-engineer'),
      spanCloseCard = addEngineerCard.querySelector('.close-card'),
      txtLoginId = addEngineerCard.querySelector('.txt-loginId'),
      txtUserName = addEngineerCard.querySelector('.txt-userName'),
      txtLocation = addEngineerCard.querySelector('.txt-location'),
      selectPartnerName = addEngineerCard.querySelector('.select-partnerName'),
      btnAddEngineer = addEngineerCard.querySelector('.btn-add-engineer');

  btnShowEngineerCard.addEventListener('click', function () {
    window.resetSelectBox(selectPartnerName, "Select Partner Name");
    addEngineerCard.parentNode.style.display = 'flex';
    $.ajax({
      "url": "/GSMCServices/service/masterData/fetchAllPartnerDetail",
      "method": "POST",
      "contentType": "application/json",
      "dataType": "json",
      "processData": false
    }).done(function (data) {
      if (data && data.length) {
        let partnersArr = [];
        for (var i = 0; i < data.length; i++) {
          partnersArr.push({
            "text": data[i].partnerName,
            "value": data[i].partnerId
          })
        }
        window.populateSelectBox(selectPartnerName, partnersArr, "Select Partner Name")
      }
    }).fail(function (err) {
      console.log("ERROR: ", err);
    });
  });
  spanCloseCard.addEventListener('click', function () {
    addEngineerCard.parentNode.style.display = 'none';
  });
  btnAddEngineer.addEventListener('click', function () {
    let errMsgs = [],
        finalErrMsg = "";
    if (!txtLoginId.value.trim())
      errMsgs.push("Login ID");
    if (!txtUserName.value.trim())
      errMsgs.push("User Name");
    if (!txtLocation.value.trim())
      errMsgs.push("Location");
    if (!selectPartnerName.value.trim())
      errMsgs.push("Partner Name");
    for (var i = 0; i < errMsgs.length; i++) {
      if (i == 0)
        finalErrMsg = "Kindly enter/select "
      finalErrMsg += errMsgs[i];
      i == errMsgs.length-1 ? finalErrMsg += "." : finalErrMsg += ", " ;
    }
    if (finalErrMsg) {
      alert(finalErrMsg);
    } else {
      let registerData = {
        "loginId": txtLoginId.value.trim(),
        "active": 1 ,
        "role": "ENGINEER",
        "engineerDetail": {
          "loginId": txtLoginId.value.trim(),
          "engineerName": txtUserName.value.trim(),
          "location": txtLocation.value.trim(),
          "partnerName": selectPartnerName.value.trim()
        }
      }
      console.log("AJAX: Register User ", registerData);
      btnAddEngineer.style.pointerEvents = 'none';
      $.ajax({
        "method": "POST",
        "url": "/GSMCServices/service/loginDetails/createNewUser",
        "contentType": "application/json",
        "dataType": "json",
        "data": JSON.stringify(registerData),
        "processData": false
      })
      .done(function( data ) {
        btnAddEngineer.style.pointerEvents = 'all';
        console.log("Add Engineer done ", data);
        alert("User registered successfully.");
        txtLoginId.value = '';
        txtUserName.value = '';
        txtLocation.value = '';
        selectPartnerName.value = ''
      })
      .fail(function (err) {
        console.error('Login request failed.', err);
        btnAddEngineer.style.pointerEvents = 'all';
        alert("We are currently unable to add an Engineer. Kindly try after some time.");
      });
    }
  });
};
window.populateSelectBox = function (selectElement, dataAsArray, title) {
  if (dataAsArray instanceof Array && selectElement) {
    selectElement.innerHTML = "";
    if (title) {
      let firstOption = document.createElement('option');
      firstOption.textContent = title;
      firstOption.setAttribute('value','');
      selectElement.appendChild(firstOption);
    }
    for (let dataPoint of dataAsArray) {
      let option = document.createElement('option');
      option.textContent = dataPoint.text;
      option.setAttribute('value', dataPoint.value);
      selectElement.appendChild(option);
    }
  } else {
    console.error('populateSelectBox failed for ' + title);
  }
};

window.resetSelectBox = function (selectElement, title) {
  if (selectElement && title) {
    selectElement.innerHTML = "";
    let firstOption = document.createElement('option');
    firstOption.textContent = title;
    firstOption.setAttribute('value','');
    selectElement.appendChild(firstOption);
  } else {
    console.error('resetSelectBox failed for ' + title);
  }
};

let logout = function () {
  window.sessionStorage.removeItem('faAdmin');
  window.location.href = 'index.html';
}
