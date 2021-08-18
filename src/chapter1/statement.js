let plays = require('./plays.json')
let invoices = require('./invoices.json')

function amountFor(aPerformance) {
    let result = 0;
    switch (playFor(aPerformance).type) {
        case "tragedy":
            result = 40000;
            if (aPerformance.audience > 30) {
                result += 1000 * (aPerformance.audience - 30);
            }
            break;
        case "comedy":
            result = 30000;
            if (aPerformance.audience > 20) {
                result += 10000 + 500 * (aPerformance.audience - 20);
            }
            result += 300 * aPerformance.audience;
            break;
        default:
            throw new Error(`unknown type: ${playFor(aPerformance).type}`);
    }

    return result;
}

function playFor(aPerformance) {
    return plays[aPerformance.playID];
}

function volumeCreditsFor(aPerformance) {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    if ("comedy" === playFor(aPerformance).type) result += Math.floor(aPerformance.audience / 5);
    return result;
}

function usd(aNumber) {
    return new Intl.NumberFormat("en-US",
        { style: "currency", currency: "USD",
            minimumFractionDigits: 2}).format(aNumber);
}

function totalVolumeCredits(invoice) {
    let volumeCredits = 0;
    for (let perf of invoice.performances) {
        volumeCredits += volumeCreditsFor(perf);
    }
    return volumeCredits;
}

function totalAmount(invoice) {
    let totalAmount = 0;
    for (let perf of invoice.performances) {
        totalAmount += amountFor(perf);
    }
    return totalAmount;
}

function statement(invoice) {
    const statementData = {}
    statementData.customer = invoice.customer
    return renderPlainText(statementData, invoice)
}

function renderPlainText(data, invoice) {
    let result = `Statement for ${data.customer}\n`;

    for (let perf of invoice.performances) {
        // print line for this order
        result += `  ${playFor(perf).name}: ${usd(amountFor(perf)/100)} (${perf.audience} seats)\n`;
    }

    result += `Amount owed is ${usd(totalAmount(invoice)/100)}\n`;
    result += `You earned ${totalVolumeCredits(invoice)} credits\n`;
    return result;
}

const assert = require("assert");

assert.deepEqual(statement(invoices[0], plays),
    "Statement for BigCo\n" +
    "  Hamlet: $650.00 (55 seats)\n" +
    "  As You Like It: $580.00 (35 seats)\n" +
    "  Othello: $500.00 (40 seats)\n" +
    "Amount owed is $1,730.00\n" +
    "You earned 47 credits\n")
console.log(statement(invoices[0], plays));