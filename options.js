function saveOptions(e) {
  e.preventDefault();
  browser.storage.sync.set({
    arbs: document.querySelector("#arbs").value
  });
}

function restoreOptions() {

  function setCurrentChoice(result) {
    document.querySelector("#arbs").value = result.arbs || "default";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  let getting = browser.storage.sync.get("arbs");
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.addEventListener("DOMContentLoaded", restoreEnabled);
document.querySelector("form").addEventListener("submit", saveOptions);


// Edit visible links // 


let checkboxes = document.querySelectorAll("input[type=checkbox]");

checkboxes.forEach(function (checkbox) {
  checkbox.addEventListener('change', () => {
    let enabledC = Array.from(checkboxes)
      .filter(i => i.checked)
      .map(i => i.value);
    SaveLinks(enabledC);
  })
});

function SaveLinks(e) {
  browser.storage.sync.set({
    enabledLinks: e
  });
}

function restoreEnabled() {
  function setCurrentChoice(result) {
    let enabledO = result.enabledLinks;
    let match = false;
    checkboxes.forEach((checkbox) => {
      match = false;
      enabledO.forEach((element) => {
        if (checkbox.name == element) {
          checkbox.checked = true;
          match = true;
        } else if (!match) {
          checkbox.checked = false;
        }
      });
    });
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  let getting = browser.storage.sync.get("enabledLinks");
  getting.then(setCurrentChoice, onError);
}