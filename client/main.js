function formatRupiah(angka, prefix) {
  var number_string = angka.replace(/[^,\d]/g, "").toString(),
    split = number_string.split(","),
    sisa = split[0].length % 3,
    rupiah = split[0].substr(0, sisa),
    ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
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
                <p class="card-text">${result.price}</p>
                <button class="btn btn-dark" id="btn-delete-wl" type="submit">Delete</button>
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
  getInvestments();
  $("#current_saldo").empty();
  $("#current-saldo").append(formatRupiah(localStorage.saldo, ","));
}

function deleteWhishlist(id) {
  $.ajax({
    url: `http://localhost:3000/whishlist/${id}`,
    method: "DELETE",
    headers: {
      access_token: localStorage.access_token,
    },
  })
    .done(() => {
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

  let name = $("#wl-name").val();
  let image_url = $("#wl-image").val();
  let price = $("#wl-price").val();
  let description = $("#wl-desc").val();

  $.ajax({
    url: "http://localhost:3000/whishlist",
    method: "POST",
    headers: {
      access_token: localStorage.access_token,
    },
    data: {
      name,
      image_url,
      price,
      description,
    },
  })
    .done(() => {
      $("#wl-name").val("");
      $("#wl-image").val("");
      $("#wl-price").val("");
      $("#wl-desc").val("");

      afterLogin();
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

  $("#btn-show-add").click(showForm);
  $("#add-container").submit(submitAdd);
  $("#form-login").click(login);

  $("#btn-logout").click(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("saldo");
    beforeLogin();
  });

  const prices = {
    crypto: [
      { value: "", desc: "--Select Investment Name--" },
      { value: "btc", desc: "BTC" },
      { value: "ethereum", desc: "Ethereum" },
      { value: "ripple", desc: "Ripple" },
    ],
    stock: [
      { value: "", desc: "--Select Investment Name--" },
      { value: "arto", desc: "Bank Jago" },
      { value: "bca", desc: "Bank BCA" },
      { value: "mandiri", desc: "Bank Mandiri" },
    ],
  };

  const invName = document.querySelector("[name=inv-name]");
  document
    .querySelector("[name=inv-type]")
    .addEventListener("change", function (e) {
      invName.innerHTML = prices[this.value].reduce(
        (acc, elem) =>
          `${acc}<option value="${elem.value}">${elem.desc}</option>`,
        ""
      );
    });
});
