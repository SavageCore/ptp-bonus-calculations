// ==UserScript==
// @name         PTP Bonus Calculations
// @namespace    https://savagecore.eu
// @version      0.1.0
// @description  Display points remaining and time left at current daily point rate until you can afford to purchase upload at PTP
// @author       SavageCore
// @include      http*://passthepopcorn.me/bonus.php?store=upload
// @require      https://raw.githubusercontent.com/zachleat/Humane-Dates/master/humane.js
// @downloadURL  https://github.com/SavageCore/ptp-bonus-calculations/raw/master/src/ptp-bonus-calculations.user.js
// @grant        none
// ==/UserScript==
//
/* global document XMLHttpRequest humaneDate */

(async function () {
	'use strict';

	const rateUrl = 'https://passthepopcorn.me/bprate.php';

	const currentPoints = Number.parseInt(document.querySelector('#nav_bonus > a:nth-child(1)').textContent.match(/Bonus \((.*)\)/g)[0].replace(/^\D+|,/g, ''), 10);
	const pointsPerDay = await getPointsPerDay();
	const table = document.querySelectorAll('.table')[0];

	for (let i = 0; i < table.rows.length; i++) {
		const row = table.rows[i];
		for (let j = 0; j < row.cells.length; j++) {
			const col = row.cells[j];
			if (col.textContent.includes('Too expensive')) {
				const cost = Number.parseInt(table.rows[i].cells[j - 1].textContent.match(/(.*) points/g)[0].replace(/^\D+|,/g, ''), 10);
				const remainingPoints = cost - currentPoints;
				const timeLeft = remainingPoints / pointsPerDay;
				const projectedDate = new Date();
				projectedDate.setDate(projectedDate.getDate() + timeLeft);
				col.title = 'Exact days left: ' + timeLeft;
				col.innerHTML = `${remainingPoints.toLocaleString()} Points remaining<br /> ~${humaneDate(projectedDate)} left`;
			}
		}
	}

	async function getPointsPerDay() {
		return new Promise((resolve, reject) => {
			const request = new XMLHttpRequest();
			request.responseType = 'document';
			request.open('GET', rateUrl, true);
			request.send(null);
			request.addEventListener('load', () => {
				if (request.status === 200) {
					const dom = request.response;
					const returnValue = Number.parseInt(dom.querySelector('table.table:nth-child(5) > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(4)').textContent.replace(/,/g, ''), 10);
					resolve(returnValue);
				} else {
					reject(new Error('Unable to load bonus rate page'));
				}
			});
		});
	}
})();
