// ==UserScript==
// @name         Dynamic Survey Generator PR/PO
// @namespace    http://tampermonkey.net/
// @version      1.81
// @description  Dynamic Generator
// @match        https://amazon.coupahost.com/requisition_headers/*
// @match        https://amazon.coupahost.com/order_headers/*
// @updateURL    https://raw.githubusercontent.com/Anzoad/tampermonkey-GPSS-scripts/main/DynamicSurveyPRPO.user.js
// @downloadURL  https://raw.githubusercontent.com/Anzoad/tampermonkey-GPSS-scripts/main/DynamicSurveyPRPO.user.js
// @run-at       document-idle
// @author       anzoad
// ==/UserScript==

(function () {
    'use strict';

    window.addEventListener('load', () => {
        let tries = 0;
        const maxTries = 30;
        const intervalMs = 500;

        const intervalId = setInterval(() => {
            tries++;
            console.log(`Intento #${tries}: buscando @gpssbuyeratend...`);

            const allMentions = document.querySelectorAll('.ApprovalTooltip__mention.s-tt-mention');
            console.log('Cantidad de menciones encontradas:', allMentions.length);

            let mentionFound = false;

            for (const mentionEl of allMentions) {
                const mentionText = mentionEl.textContent.trim();
                console.log(`Revisando mención: ${mentionText}`);
                if (mentionText === '(@gpssbuyeratend)') {
                    mentionFound = true;
                    break;
                }
            }

            if (mentionFound) {
                console.log('Mención @gpssbuyeratend encontrada. Ejecutando script...');
                clearInterval(intervalId);

                const pathParts = location.pathname.split('/');
                const docNumber = pathParts[2];

                const isPO = location.href.includes('order_headers/');
                const coupaType = isPO ? 'purchase order' : 'purchase request';

                const mentionEl = document.querySelector('.ApprovalTooltip__mention.s-tt-mention');
                const nameEl = document.querySelector('.ApprovalTooltip__title.s-tt-title');

                let login = null;
                if (mentionEl) {
                    const mentionText = mentionEl.textContent.trim();
                    if (mentionText.startsWith('(@') && mentionText.endsWith(')')) {
                        login = mentionText.slice(2, -1);
                    }
                }

                let firstName = null;
                if (nameEl) {
                    const fullName = nameEl.textContent.trim();
                    firstName = fullName.split(' ')[0];
                }

                if (login && firstName) {
                    const docNumberForSurvey = isPO ? `2D-${docNumber}` : docNumber;
                    const surveyLink = `https://amazonexteu.qualtrics.com/jfe/form/SV_0uMILSfPE4xIzKm?tt=${docNumberForSurvey}`;
                    const coupaLink = window.location.href;

                    const commentMessageDefault =
                        `Hello @${login},\n\n` +
                        `We hope we met your expectations with your recent ${coupaType}: ${coupaLink}. We'd like to hear your thoughts on the experience.\n\n` +
                        `Please take our brief 5-minute survey to share your feedback on your interaction with the Global Procurement Center Services team. ` +
                        `Your insights are crucial for enhancing our service quality.\n\n` +
                        `Survey Link: ${surveyLink}\n\n` +
                        `Your responses will directly influence how we improve our services. We appreciate your time and look forward to your feedback.\n\n` +
                        `Thank you for helping us serve you better.\n\n` +
                        `Global Procurement Center Services Team`;

                    const commentMessageEAM =
                        `Hello,\n\n` +
                        `We hope we met your expectations with your recent ${coupaType}: ${coupaLink}. We'd like to hear your thoughts on the experience.\n\n` +
                        `Please take our brief 5-minute survey to share your feedback on your interaction with the Global Procurement Center Services team. ` +
                        `Your insights are crucial for enhancing our service quality.\n\n` +
                        `Survey Link: ${surveyLink}\n\n` +
                        `Your responses will directly influence how we improve our services. We appreciate your time and look forward to your feedback.\n\n` +
                        `Thank you for helping us serve you better.\n\n` +
                        `Global Procurement Center Services Team`;

                    if (firstName.toUpperCase() === 'EAM') {
                        const commentEl = document.getElementById('addCommentFieldId_1');
                        if (commentEl) {
                            commentEl.value = commentMessageEAM;
                        } else {
                            console.warn('No se encontró el textarea con id="addCommentFieldId_1".');
                        }
                        return;
                    }

                    const emailMessage =
                        `Hello ${firstName},\n\n` +
                        `We hope we met your expectations with your recent ${coupaType}: ${coupaLink}. We'd like to hear your thoughts on the experience.\n\n` +
                        `Please take our brief 5-minute survey to share your feedback on your interaction with the Global Procurement Center Services team. ` +
                        `Your insights are crucial for enhancing our service quality.\n\n` +
                        `Survey Link: ${surveyLink}\n\n` +
                        `Your responses will directly influence how we improve our services. We appreciate your time and look forward to your feedback.\n\n` +
                        `Thank you for helping us serve you better.\n\n` +
                        `Global Procurement Center Services Team`;

                    const subject = encodeURIComponent('Quick Survey on Your Recent Purchase Request Experience');
                    const email = `${login}@amazon.com`;
                    const body = encodeURIComponent(emailMessage);
                    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
                    window.open(mailtoUrl, '_blank');

                    const commentEl = document.getElementById('addCommentFieldId_1');
                    if (commentEl) {
                        commentEl.value = commentMessageDefault;
                    } else {
                        console.warn('No se encontró el textarea con id="addCommentFieldId_1".');
                    }
                }
            } else if (tries >= maxTries) {
                clearInterval(intervalId);
                console.warn('No se encontró la mención @gpssbuyeratend. Deteniendo script.');
            }
        }, intervalMs);
    });
})();
