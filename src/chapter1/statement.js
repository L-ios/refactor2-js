function amountFor(perf, play) {
    let result = 0;
    switch (play.type) {
        case "tragedy":
            result = 40000;
            if (perf.audience > 30) {
                result += 1000 * (perf.audience - 30);
            }
            break;
        case "comedy":
            result = 30000;
            if (perf.audience > 20) {
                result += 10000 + 500 * (perf.audience - 20);
            }
            result += 300 * perf.audience;
            break;
        default:
            throw new Error(`unknown type: ${play.type}`);
    }

    return result;
}

function statement(invoice, plays) {
    let totalAmount = 0;
    let volumeCredits = 0;
    let result = `Statement for ${invoice.customer}\n`;
    const format = new Intl.NumberFormat("en-US",
        { style: "currency", currency: "USD",
            minimumFractionDigits: 2}).format;

    for (let perf of invoice.performances) {
        const play = plays[perf.playID];
        let thisAmount = amountFor(perf, play);

        // add volume credits
        volumeCredits += Math.max(perf.audience - 30, 0);
        // add extra credit for every ten comedy attendees
        if ("comedy" === play.type) volumeCredits += Math.floor(perf.audience / 5);

        // print line for this order
        result += `  ${play.name}: ${format(thisAmount/100)} (${perf.audience} seats)\n`;
        totalAmount += thisAmount;
    }
    result += `Amount owed is ${format(totalAmount/100)}\n`;
    result += `You earned ${volumeCredits} credits\n`;
    return result;
}

let plays = require('./plays.json')
let invoices = require('./invoices.json')
const assert = require("assert");

assert.deepEqual(statement(invoices[0], plays),
    "Statement for BigCo\n" +
    "  Hamlet: $650.00 (55 seats)\n" +
    "  As You Like It: $580.00 (35 seats)\n" +
    "  Othello: $500.00 (40 seats)\n" +
    "Amount owed is $1,730.00\n" +
    "You earned 47 credits\n")
console.log(statement(invoices[0], plays));