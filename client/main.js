function formatRupiah(angka, prefix) {
  var number_string = angka.replace(/[^,\d]/g, "").toString(),
    split = number_string.split(","),
    sisa = split[0].length % 3,
    rupiah = split[0].substr(0, sisa),
    ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    separator = sisa ? "," : "";
    rupiah += separator + ribuan.join(",");
  }

  rupiah = split[1] != undefined ? rupiah + "," + split[1] : rupiah;
  return prefix == undefined ? rupiah : rupiah ? "Rp. " + rupiah : "";
}

function login(event) {
  event.preventDefault();
  let email = $("#email-login").val();
  let password = $("#password-login").val();
  $.ajax({
    url: "http://localhost:3000/login",
    method: "POST",
    data: {
      email,
      password,
    },
  })
    .done((result) => {
      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("saldo", result.saldo);
      afterLogin();
    })
    .fail((err) => {
      console.log(err);
    })
    .always(() => {
      $("#email-login").val("");
      $("#password-login").val("");
    });
}

function getAvatar() {
  $.ajax({
    url: "https://doppelme-avatars.p.rapidapi.com/bodytypes",
    method: "GET",
    headers: {
      "x-rapidapi-key": "984a3ee667msh808246406f36ce9p15a846jsnfa68a0382421",
      "x-rapidapi-host": "doppelme-avatars.p.rapidapi.com",
    },
  })
    .done((result) => {
      $("#avatar").append(`<img src=${result.bodytypes[0].imageSrc}>`);
    })
    .catch((err) => console.log(err));
}

function getInvestments() {
  $.ajax({
    url: "http://localhost:3000/investments",
    method: "GET",
    headers: {
      access_token: localStorage.access_token,
    },
  })
    .done((result) => {
      result.forEach((result) => {
        $("#investments").append(`
            <div class="col-4 mb-4">
            <div class="card text-center">
                <div class="card-body">
                <h5 class="card-title">${result.name}</h5>
                <p class="card-text">${formatRupiah(
                  String(result.price),
                  "Rp. "
                )}</p>
                <button class="btn btn-dark" id="btn-delete-wl" type="submit" onclick="deleteInvestment(${
                  result.id
                })">Delete</button>
                </div>
            </div>
            </div>
              `);
      });
    })
    .fail((err) => {
      console.log(err);
    });
}

function beforeLogin() {
  $("#login-container").show();
  $("#btn-logout").hide();
  $("#home-container").hide();
  $("#add-container").hide();
}

function afterLogin() {
  $("#btn-logout").show();
  $("#home-container").show();
  $("#login-container").hide();
  $("#add-container").show();
  getAvatar();
  getInvestments();
  $("#current_saldo").empty();
  $("#current-saldo").append(formatRupiah(localStorage.saldo, "Rp. "));
}

function deleteInvestment(id) {
  $.ajax({
    url: `http://localhost:3000/investments/${id}`,
    method: "DELETE",
    headers: {
      access_token: localStorage.access_token,
    },
  })
    .done((result) => {
      localStorage.setItem("saldo", result.saldo);
      afterLogin();
    })
    .fail((err) => {
      console.log(err);
    });
}

function showForm() {
  $("#add-container").show();
}

function submitAdd(event) {
  event.preventDefault();

  let name = $("#inv-name").val();
  let price = Math.round(
    Number($("#inv-amount").val()) *
      Number($("#inv-price").val().replace(/\D/g, ""))
  );

  $.ajax({
    url: "http://localhost:3000/investments",
    method: "POST",
    headers: {
      access_token: localStorage.access_token,
    },
    data: {
      name,
      price,
    },
  })
    .done((result) => {
      $("#inv-type").val("");
      $("#inv-name").val("");
      $("#inv-price").val("");
      $("#inv-amount").val("");
      let lastSaldo = localStorage.saldo - result.price;
      localStorage.setItem("saldo", lastSaldo);

      afterLogin();
    })
    .fail((err) => {
      console.log(err);
    });
}

// GOOGLE OAUTH SIGNIN
function onSignIn(googleUser) {
  var id_token = googleUser.getAuthResponse().id_token;

  $.ajax({
    url: "http://localhost:3000/googleLogin",
    method: "POST",
    data: {
      idToken: id_token,
    },
  })
    .done((result) => {
      localStorage.setItem("access_token", result.access_token);
      afterLogin();
    })
    .fail((err) => {
      console.log(err);
    });
}

// GOOGLE OAUTH SIGN OUT
function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log("User signed out.");
  });
}

function onFailure(error) {
  console.log(error);
}

// GOOGLE OAUTH STYLE
function renderButton() {
  gapi.signin2.render("my-signin2", {
    scope: "profile email",
    width: 335,
    height: 50,
    longtitle: true,
    theme: "dark",
    onsuccess: onSignIn,
    onfailure: onFailure,
  });
}

function fetchStock() {
  $.ajax({
    url: `http://localhost:3000/investments/stocks`,
    method: "GET",
    headers: {
      access_token: localStorage.access_token,
    },
  })
    .done((result) => {
      localStorage.setItem("stocks", result.results);
    })
    .fail((err) => {
      console.log(err);
    });
}

$(document).ready(function () {
  if (localStorage.access_token) {
    afterLogin();
  } else {
    beforeLogin();
  }

  if (localStorage.access_token) {
    fetchStock();
    $.ajax({
      url: `http://localhost:3000/investments/crypto`,
      method: "GET",
      headers: {
        access_token: localStorage.access_token,
      },
    })
      .done((result) => {
        localStorage.setItem("crypto_prices", result.results);
      })
      .fail((err) => {
        console.log(err);
      });
  }

  $("#btn-show-add").click(showForm);
  $("#add-form").submit(submitAdd);
  $("#form-login").click(login);

  $("#btn-logout").click(() => {
    signOut();
    localStorage.removeItem("access_token");
    localStorage.removeItem("saldo");
    localStorage.removeItem("crypto_prices");
    beforeLogin();
  });

  const prices = {
    crypto: [
      { value: "", desc: "--Select Investment Name--" },
      { value: "BTC", desc: "BTC" },
      { value: "XRP", desc: "Ethereum" },
      { value: "ETH", desc: "Ripple" },
      { value: "DOGE", desc: "Doge" },
    ],
    stock: [
      { value: "", desc: "--Select Investment Name--" },
      { value: "ARTO.JK", desc: "Bank Jago" },
      { value: "BBCA.JK", desc: "Bank BCA" },
      { value: "BMRI.JK", desc: "Bank Mandiri" },
      { value: "UNVR.JK", desc: "Unilever" },
    ],
  };

  const invName = document.querySelector("[name=inv-name]");
  const invPrice = document.querySelector("[name=inv-price]");
  const invType = document.querySelector("[name=inv-type]");
  document
    .querySelector("[name=inv-type]")
    .addEventListener("change", function (e) {
      invName.innerHTML = prices[this.value].reduce(
        (acc, elem) =>
          `${acc}<option value="${elem.value}">${elem.desc}</option>`,
        ""
      );
    });
  document
    .querySelector("[name=inv-name]")
    .addEventListener("change", function (e) {
      if (invType.value === "stock") {
        invPrice.value = formatRupiah(
          String(Math.round(JSON.parse(localStorage.stocks)[this.value])),
          "Rp. "
        );
      } else {
        invPrice.value = formatRupiah(
          String(
            Math.round(JSON.parse(localStorage.crypto_prices)[this.value])
          ),
          "Rp. "
        );
      }
    });
});
