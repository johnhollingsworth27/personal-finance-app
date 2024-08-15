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

    // Validate the number of selected growth rates
    if (growthRates.length > 3) {
        alert('Please select up to 3 growth rates.');
        return;
    }

    // Function to format numbers as currency (e.g., "1,234,567")
    function formatCurrency(value) {
        return Math.round(value).toLocaleString();
    }

    // Function to calculate future value with increasing contributions
    function futureValue(P, PMT, r, g, n) {
        let FV_initial = P * Math.pow((1 + r), n);  // Future value of the initial investment
        let FV_contrib = 0;
        for (let i = 1; i <= n; i++) {
            FV_contrib += PMT * Math.pow((1 + r), (n - i));
            PMT = PMT * (1 + g);  // Increase contributions by the specified rate each year
        }
        return FV_initial + FV_contrib;
    }

    // Prepare results table
    let results = '<table border="1"><tr><th>Age</th>';
    growthRates.forEach(rate => {
        if (brokerage > 0 || brokerageContribution > 0) {
            results += `<th>Brokerage Account (${(rate * 100).toFixed(0)}%)</th>`;
        }
        if (rothIra > 0 || rothIraContribution > 0) {
            results += `<th>Roth IRA (${(rate * 100).toFixed(0)}%)</th>`;
        }
        if (account401k > 0 || account401kContribution > 0) {
            results += `<th>401k (${(rate * 100).toFixed(0)}%)</th>`;
        }
        results += `<th>Total (${(rate * 100).toFixed(0)}%)</th>`;
    });
    results += '</tr>';

    // Variable to store user-specific formula details
    let formulaDetails = '';

    let formulaGroupedByRate = {};  // Grouping formulas by rate

    // Function to format numbers as currency with no decimal places
    function formatCurrency(value) {
        return Math.round(value).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
    }

    // Calculate future values for each age
    for (let age = startAge; age <= endAge; age += ageIncrement) {
        results += `<tr><td>${age}</td>`;
        growthRates.forEach(rate => {
            const years = age - currentAge;
            let brokerageFV = 0, rothIraFV = 0, account401kFV = 0, totalFV = 0;

            // Initialize grouping if not yet done
            if (!formulaGroupedByRate[rate]) {
                formulaGroupedByRate[rate] = '';
            }

            if (brokerage > 0 || brokerageContribution > 0) {
                brokerageFV = futureValue(brokerage, brokerageContribution, rate, contributionIncrease, years);
                results += `<td>${formatCurrency(brokerageFV)}</td>`;
                totalFV += brokerageFV;
                formulaGroupedByRate[rate] += `
            <div>
                <strong>Age ${age} ~ ${formatCurrency(brokerageFV)} = </strong>
                ${formatCurrency(brokerage)} * (1 + ${rate})^${years} + ${formatCurrency(brokerageContribution)} * ((1 + ${rate})^${years} - 1) / ${rate}
            </div>`;
            }

            if (rothIra > 0 || rothIraContribution > 0) {
                rothIraFV = futureValue(rothIra, rothIraContribution, rate, contributionIncrease, years);
                results += `<td>${formatCurrency(rothIraFV)}</td>`;
                totalFV += rothIraFV;
                formulaGroupedByRate[rate] += `
            <div>
                <strong>Age ${age} ~ ${formatCurrency(rothIraFV)} = </strong>
                ${formatCurrency(rothIra)} * (1 + ${rate})^${years} + ${formatCurrency(rothIraContribution)} * ((1 + ${rate})^${years} - 1) / ${rate}
            </div>`;
            }

            if (account401k > 0 || account401kContribution > 0) {
                account401kFV = futureValue(account401k, account401kContribution, rate, contributionIncrease, years);
                results += `<td>${formatCurrency(account401kFV)}</td>`;
                totalFV += account401kFV;
                formulaGroupedByRate[rate] += `
            <div>
                <strong>Age ${age} ~ ${formatCurrency(account401kFV)} = </strong> 
                ${formatCurrency(account401k)} * (1 + ${rate})^${years} + ${formatCurrency(account401kContribution)} * ((1 + ${rate})^${years} - 1) / ${rate}
            </div>`;
            }

            results += `<td>${formatCurrency(totalFV)}</td>`;
        });
        results += '</tr>';
    }

    results += '</table>';
    document.getElementById('results').innerHTML = results;

    // Constructing the formulaDetails by rate
    for (let rate in formulaGroupedByRate) {
        formulaDetails += `
    <div style="padding: 6px; text-align: center; background-color: #333; color: white; border: none; margin-bottom: 10px; margin-top: 20px;">
        <h2>Market Growth Rate: ${(rate * 100).toFixed(0)}%</h2> 
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <div style="padding: 6px; text-align: center; background-color: #707070; color: white; border: none; margin-bottom: 10px;"><strong>Brokerage Account</strong></div>
        <div style="padding: 6px; text-align: center; background-color: #707070; color: white; border: none; margin-bottom: 10px;"><strong>Roth IRA</strong></div>
        <div style="padding: 6px; text-align: center; background-color: #707070; color: white; border: none; margin-bottom: 10px;"><strong>401k</strong></div>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        ${formulaGroupedByRate[rate]}
    </div>
    <hr>
`;
    }
    // Display the formula explanation and the user's input-based formula
    let formulaExplanation = `
    <h2>How did we do it?</h2>
    <h3>Formula Used for Calculations</h3>
    <p>The future value of the initial contribution plus the increasing contributions can be written as:</p>
    <p><img src="FV-formula.png" alt="Formula for Future Value with Increasing Contributions" style="max-width: 100%; height: auto;"></p>

    <p>Where:</p>
    <ul>
        <li><strong>FV:</strong> Final value of account balance </li>
        <li><strong>P:</strong> Principal investment </li>
        <li><strong>r:</strong> Annual growth rate (e.g., 5%, 6%, 7%, etc.)</li>
        <li><strong>n:</strong> Number of years (calculated as the difference between target age and current age)</li>
        <li><strong>PMT<sub>0</sub>:</strong> Initial yearly contribution</li>
        <li><strong>g:</strong> Annual increase rate of contributions (e.g., 5%)</li>
        <li><strong>t:</strong> Each individual year from 1 to n</li>
    </ul>
    <h3>User Input Values in the Formula</h3>
    ${formulaDetails}
`;


    document.getElementById('formulaExplanation').innerHTML = formulaExplanation;

    document.getElementById('downloadButton').style.display = 'block';

    // Implement download functionality (optional: can generate a CSV file for download)
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
});
