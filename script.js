document.getElementById('financeForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Retrieve input values, default to 0 if not provided
    const brokerage = parseFloat(document.getElementById('brokerage').value) || 0;
    const rothIra = parseFloat(document.getElementById('rothIra').value) || 0;
    const account401k = parseFloat(document.getElementById('account401k').value) || 0;

    const brokerageContribution = parseFloat(document.getElementById('brokerageContribution').value) || 0;
    const rothIraContribution = parseFloat(document.getElementById('rothIraContribution').value) || 0;
    const account401kContribution = parseFloat(document.getElementById('account401kContribution').value) || 0;

    const growthRates = Array.from(document.querySelectorAll('input[name="growthRates"]:checked')).map(input => parseFloat(input.value) / 100);
    const contributionIncrease = parseFloat(document.getElementById('contributionIncrease').value) / 100 || 0;

    const currentAge = parseInt(document.getElementById('currentAge').value);
    const [startAge, endAge] = document.getElementById('ageRange').value.split('-').map(Number);
    const ageIncrement = parseInt(document.getElementById('ageIncrement').value);
    const years = endAge - currentAge;

    // Validate the number of selected growth rates
    if (growthRates.length > 3) {
        alert('Please select up to 3 growth rates.');
        return;
    }

    // Function to format numbers as currency
    function formatCurrency(value) {
        return Math.round(value).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
    }

    // Function to calculate future value with increasing contributions
    function futureValue(P, PMT, r, g, n) {
        let FV_initial = P * Math.pow((1 + r), n);
        let FV_contrib = 0;
        for (let i = 1; i <= n; i++) {
            FV_contrib += PMT * Math.pow((1 + r), (n - i));
            PMT = PMT * (1 + g);
        }
        return FV_initial + FV_contrib;
    }

    // Define colors for each growth rate section and total columns
    const colors = ['#eee2c2', '#ead297', '#d1ba96'];
    const totalColors = '#fcf9f3';

    // Prepare results table with colored headers and sections
    let results = '<table><thead><tr><th>Age</th>';
    growthRates.forEach((rate, index) => {
        // Use the color for each growth rate's title cell (header) and data columns
        const color = colors[index % colors.length];
        results += `<th colspan="4" style="border: 2px solid #333; background-color: ${color}; font-weight: bold; text-align: center;">${(rate * 100).toFixed(0)}% Growth Rate</th>`;
    });
    results += '</tr><tr><th></th>';

    // Add sub-headers for account types under each growth rate with the same color as the growth rate section
    growthRates.forEach((_, index) => {
        const color = colors[index % colors.length];
        results += `
            <th style="background-color: ${color}; border: 1px solid #333; text-align: center;">Brokerage Account</th>
            <th style="background-color: ${color}; border: 1px solid #333; text-align: center;">Roth IRA</th>
            <th style="background-color: ${color}; border: 1px solid #333; text-align: center;">401k</th>
            <th style="background-color: ${totalColors}; border: 1px solid #333; font-weight: bold; text-align: center;">Total</th>
        `;

    });
    results += '</tr></thead><tbody>';

    // Calculate future values for each age
    for (let age = startAge; age <= endAge; age += ageIncrement) {
        results += `<tr><td style="border: 1px solid #333;">${age}</td>`;
        growthRates.forEach((rate, index) => {
            const years = age - currentAge;
            let brokerageFV = futureValue(brokerage, brokerageContribution, rate, contributionIncrease, years);
            let rothIraFV = futureValue(rothIra, rothIraContribution, rate, contributionIncrease, years);
            let account401kFV = futureValue(account401k, account401kContribution, rate, contributionIncrease, years);
            let totalFV = brokerageFV + rothIraFV + account401kFV;

            // Use the same color for each growth rate's columns
            const color = colors[index % colors.length];
            //const totalColor = totalColors[index % totalColors.length];

            results += `<td style="background-color: ${color}; border: 1px solid #333;">${formatCurrency(brokerageFV)}</td>`;
            results += `<td style="background-color: ${color}; border: 1px solid #333;">${formatCurrency(rothIraFV)}</td>`;
            results += `<td style="background-color: ${color}; border: 1px solid #333;">${formatCurrency(account401kFV)}</td>`;
            results += `<td style="background-color: ${totalColors}; border: 1px solid #333; font-weight: bold;">${formatCurrency(totalFV)}</td>`;
        });
        results += '</tr>';
    }

    results += '</tbody></table>';
    document.getElementById('results').innerHTML = results;


    // Display the download button
    document.getElementById('downloadButton').style.display = 'block';

    document.getElementById('downloadButton').addEventListener('click', function () {
        const blob = new Blob([results], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'future_values.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Calculate example future values for the first growth rate using Brokerage and Roth IRA
    const exampleRate = growthRates[0];
    const exampleFutureValueBrokerage = futureValue(brokerage, brokerageContribution, exampleRate, contributionIncrease, years);
    const exampleFutureValueRothIra = futureValue(rothIra, rothIraContribution, exampleRate, contributionIncrease, years);

    // Generate the formula explanation content with both examples
    const formulaExplanationContent = `
        <div style="margin-top: 20px; padding: 20px; background-color: #f7f7f7; border-radius: 8px;">
            <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Formula Explanation</h2>
            <div>
                <p style="padding: 16px; background-color: #ffffff; border-radius: 4px;">
                    \\[
                    FV = P \\times (1 + r)^n + \\sum_{t=1}^{n} PMT_0 \\times (1 + g)^{t-1} \\times (1 + r)^{n - t}
                    \\]
                </p>
            </div>
            
            <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">Variable Definitions:</h3>
            <ul style="list-style-type: disc; padding-left: 20px;">
                <li><strong>FV:</strong> Final value of account balance</li>
                <li><strong>P:</strong> Principal investment</li>
                <li><strong>r:</strong> Annual growth rate</li>
                <li><strong>n:</strong> Number of years</li>
                <li><strong>PMT₀:</strong> Initial yearly contribution</li>
                <li><strong>g:</strong> Annual increase rate of contributions</li>
                <li><strong>t:</strong> Each individual year from 1 to n</li>
            </ul>

            <h3 style="font-size: 20px; font-weight: bold; margin-top: 24px;">Example Calculation - Brokerage Account</h3>
            <p style="padding: 16px; background-color: #ffffff; border-radius: 4px;">
                For an initial investment of \\( P = ${brokerage} \\), annual contribution of \\( PMT_0 = ${brokerageContribution} \\),
                growth rate of \\( r = ${exampleRate} \\), annual contribution increase rate of \\( g = ${contributionIncrease} \\),
                and a time span of \\( n = ${years} \\) years:
            </p>
            <p style="padding: 16px; background-color: #ffffff; border-radius: 4px;">
                \\[
                FV = ${brokerage} \\times (1 + ${exampleRate})^{${years}} + \\sum_{t=1}^{${years}} ${brokerageContribution} \\times (1 + ${contributionIncrease})^{t-1} \\times (1 + ${exampleRate})^{${years} - t}
                \\]
            </p>
            <p style="padding: 16px; background-color: #ffffff; border-radius: 4px;">
                After ${years} years your final value <strong>(FV) = ${formatCurrency(exampleFutureValueBrokerage)}</strong>
            </p>

            <h3 style="font-size: 20px; font-weight: bold; margin-top: 24px;">Example Calculation - Roth IRA</h3>
            <p style="padding: 16px; background-color: #ffffff; border-radius: 4px;">
                For an initial investment of \\( P = ${rothIra} \\), annual contribution of \\( PMT_0 = ${rothIraContribution} \\),
                growth rate of \\( r = ${exampleRate} \\), annual contribution increase rate of \\( g = ${contributionIncrease} \\),
                and a time span of \\( n = ${years} \\) years:
            </p>
            <p style="padding: 16px; background-color: #ffffff; border-radius: 4px;">
                \\[
                FV = ${rothIra} \\times (1 + ${exampleRate})^{${years}} + \\sum_{t=1}^{${years}} ${rothIraContribution} \\times (1 + ${contributionIncrease})^{t-1} \\times (1 + ${exampleRate})^{${years} - t}
                \\]
            </p>
            <p style="padding: 16px; background-color: #ffffff; border-radius: 4px;">
                After ${years} years your final value <strong>(FV) = ${formatCurrency(exampleFutureValueRothIra)}</strong>
            </p>
        </div>
`;

    // Insert the formula explanation content into the HTML
    document.getElementById('formulaExplanation').innerHTML = formulaExplanationContent;

    // Trigger MathJax to typeset the new content
    if (window.MathJax) {
        MathJax.typesetPromise();
    }

});
