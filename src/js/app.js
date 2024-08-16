

App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    hasVoted: false,
    votedForID: 0,
    finishElection: 0,
    mins: 0,

    init: async function () {
        await App.initWeb3();
        return App.initContract();
    },

    initWeb3: async function () {
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                await window.ethereum.enable();
            } catch (error) {
                console.error("User denied account access");
            }
        } else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);
        const accounts = await web3.eth.getAccounts();
        web3.eth.defaultAccount = accounts[0];
        App.account = accounts[0];
    },

    initContract: async function () {
        const response = await fetch("Election.json");
        const election = await response.json();
        App.contracts.Election = new web3.eth.Contract(election.abi, election.networks[5777].address);
        App.listenForEvents();
        return App.render();
    },

    listenForEvents: function () {
        App.contracts.Election.events.votedEvent({
            fromBlock: 0,
            toBlock: 'latest'
        }, function (error, event) {
            console.log("event triggered", event);
        });
    },

    render: async function () {
        var loader = $("#loader");
        var content = $("#content");

        loader.show();
        content.hide();

        $("#accountAddress").html("Your Account: " + App.account);

        const electionInstance = App.contracts.Election;
        const manager = await electionInstance.methods.manager().call();
        if (manager !== App.account) {
            document.querySelector('.buy-tickets').style.display = 'none';
        }

        const candidatesCount = await electionInstance.methods.candidatesCount().call();

        var candidatesResults = $("#candidatesResults");
        candidatesResults.empty();

        var candidatesSelect = $('#candidatesSelect');
        candidatesSelect.empty();

        for (var i = 1; i <= candidatesCount; i++) {
            const candidate = await electionInstance.methods.candidates(i).call();
            var id = candidate[0];
            var fname = candidate[1];
            var lname = candidate[2];
            var idNumber = candidate[3];
            var voteCount = candidate[4];

            var candidateTemplate = "<tr><th>" + id + "</th><td>" + fname + " " + lname + "</td><td>" + idNumber + "</td><td>" + voteCount + "</td></tr>"
            candidatesResults.append(candidateTemplate);

            var candidateOption = "<option value='" + id + "' >" + fname + " " + lname + "</option>"
            candidatesSelect.append(candidateOption);
        }

        const hasVoted = await electionInstance.methods.voters(App.account).call();
        if (hasVoted) {
            $('form').hide();
            $("#index-text").html("You are successfully logged in!");
            $("#new-candidate").html("New candidates can't be added. The election process has already started.");
            $("#vote-text").html("Vote casted successfully for candidate " + localStorage.getItem("votedForID"));
        }

        loader.hide();
        content.show();

        const usersCount = await electionInstance.methods.usersCount().call();
        var voterz = $("#voterz");
        voterz.empty();

        for (var i = 1; i <= usersCount; i++) {
            const user = await electionInstance.methods.users(i).call();
            var firstName = user[0];
            var lastName = user[1];
            var idNumber = user[2];
            var email = user[3];
            var address = user[5];

            let voterTemplate = "<tr><td>" + firstName + " " + lastName + "</td><td>" + idNumber + "</td><td>" + email + "</td><td>" + address + "</td></tr>";
            voterz.append(voterTemplate);
        }

        if (localStorage.getItem("finishElection") === "1") {
            $('form').hide();
            $("#index-text").html("There is no active election ongoing at the moment");
            $("#vote-text").html("No active voting ongoing");
            document.querySelector('.addCandidateForm').style.display = 'block';
            document.querySelector('.vot').style.display = 'none';
        }
    },

    castVote: async function () {
        var candidateId = $('#candidatesSelect').val();
        App.votedForID = candidateId;
        localStorage.setItem("votedForID", candidateId);

        const electionInstance = App.contracts.Election;
        await electionInstance.methods.vote(candidateId).send({ from: App.account });

        $("#content").hide();
        $("#loader").show();
        location.href = 'results.html';
    },

    addUser: async function () {
        var firstName = $('#firstName').val();
        var lastName = $('#lastName').val();
        var idNumber = $('#idNumber').val();
        var email = $('#email').val();
        var password = $('#password').val();

        const electionInstance = App.contracts.Election;
        await electionInstance.methods.addUser(firstName, lastName, idNumber, email, password).send({ from: App.account });

        $("#content").hide();
        $("#loader").show();
        document.querySelector('.vot').style.display = 'block';
        location.href = 'vote.html';
    },

    addCandidate: async function () {
        var CfirstName = $('#CfirstName').val();
        var ClastName = $('#ClastName').val();
        var CidNumber = $('#CidNumber').val();

        const electionInstance = App.contracts.Election;
        await electionInstance.methods.addCandidate(CfirstName, ClastName, CidNumber).send({ from: App.account });

        $("#content").hide();
        $("#loader").show();
        location.href = 'admin.html';
    },

    login: async function () {
        var lidNumber = $('#lidNumber').val();
        var lpassword = $('#lpassword').val();

        const electionInstance = App.contracts.Election;
        const usersCount = await electionInstance.methods.usersCount().call();

        for (var i = 1; i <= usersCount; i++) {
            let user = await electionInstance.methods.users(i).call();
            let idNumber = user[2];
            let password = user[4];

            if (lidNumber === idNumber && lpassword === password) {
                location.href = 'results.html';
                break;
            } else {
                alert("Incorrect login details, Please try again");
            }
        }
    },

    startElection: function () {
        localStorage.setItem("finishElection", "0");
        location.href = 'index.html';
    },

    endElection: function () {
        localStorage.setItem("finishElection", "1");
        location.href = 'results.html';
    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
