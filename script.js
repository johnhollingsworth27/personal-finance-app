document.getElementById('financeForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Retrieve input values
    const brokerage = parseFloat(document.getElementById('brokerage').value);
    const rothIra = parseFloat(document.getElementById('rothIra').value);
    const account401k = parseFloat(document.getElementById('account401k').value);
    
    const brokerageContribution = parseFloat(document.getElementById('brokerageContribution').value);
    const rothIraContribution = parseFloat(document.getElementById('rothIraContribution').value);
    const account401kContribution = parseFloat(document.getElementById('account401kContribution').value);
    
    const growthRates = Array.from(document.getElementById('growthRates').selectedOptions).map(option => parseFloat(option.value) / 100);
    const contributionIncrease = parseFloat(document.getElementById('contributionIncrease').value) / 100;
    
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
        results += `<th>Brokerage Account (${(rate * 100).toFixed(0)}%)</th><th>Roth IRA (${(rate * 100).toFixed(0)}%)</th><th>401k (${(rate * 100).toFixed(0)}%)</th><th>Total (${(rate * 100).toFixed(0)}%)</th>`;
    });
    results += '</tr>';
    
    // Calculate future values for each age
    for (let age = startAge; age <= endAge; age += ageIncrement) {
        results += `<tr><td>${age}</td>`;
        growthRates.forEach(rate => {
            const years = age - currentAge;
            const brokerageFV = futureValue(brokerage, brokerageContribution, rate, contributionIncrease, years);
            const rothIraFV = futureValue(rothIra, rothIraContribution, rate, contributionIncrease, years);
            const account401kFV = futureValue(account401k, account401kContribution, rate, contributionIncrease, years);
            const totalFV = brokerageFV + rothIraFV + account401kFV;
            results += `<td>${formatCurrency(brokerageFV)}</td><td>${formatCurrency(rothIraFV)}</td><td>${formatCurrency(account401kFV)}</td><td>${formatCurrency(totalFV)}</td>`;
        });
        results += '</tr>';
    }
    
    results += '</table>';
    document.getElementById('results').innerHTML = results;
    document.getElementById('downloadButton').style.display = 'block';
    
    // Implement download functionality (optional: can generate a CSV file for download)
    document.getElementById('downloadButton').addEventListener('click', function() {
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
