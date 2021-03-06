let plays = require('./plays.json')
let invoices = require('./invoices.json')

function amountFor(aPerformance) {
    let result = 0;
    switch (aPerformance.play.type) {
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
            throw new Error(`unknown type: ${aPerformance.play.type}`);
    }

    return result;
}

function playFor(aPerformance) {
    return plays[aPerformance.playID];
}

function volumeCreditsFor(aPerformance) {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    if ("comedy" === aPerformance.play.type) result += Math.floor(aPerformance.audience / 5);
    return result;
}

function usd(aNumber) {
    return new Intl.NumberFormat("en-US",
        { style: "currency", currency: "USD",
            minimumFractionDigits: 2}).format(aNumber/100);
}

function totalVolumeCredits(data) {
    return data.performances.reduce((total, p) =>  total + p.volumeCredits, 0);
}

function totalAmount(data) {
    return data.performances.reduce((total, p) =>  total + p.amount, 0);
}

function statement(invoice) {
    return renderPlainText(createStatementData(invoice))
}

function createStatementData(invoice) {
    const result = {}
    result.customer = invoice.customer
    result.performances = invoice.performances.map(enrichPerformance);
    result.totalAmount = totalAmount(result)
    result.totalVolumeCredits = totalVolumeCredits(result)

    return result
}

function enrichPerformance(aPerformance) {
    const result = Object.assign({}, aPerformance);
    result.play = playFor(result)
    result.amount = amountFor(result)
    result.volumeCredits = volumeCreditsFor(result)
    return result;
}

function renderPlainText(data) {
    let result = `Statement for ${data.customer}\n`;

    for (let perf of data.performances) {
        // print line for this order
        result += `  ${perf.play.name}: ${usd(perf.amount)} (${perf.audience} seats)\n`;
    }

    result += `Amount owed is ${usd(data.totalAmount)}\n`;
    result += `You earned ${data.totalVolumeCredits} credits\n`;
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

