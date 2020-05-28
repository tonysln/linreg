function calculate(x_values, y_values) {
    // In case of prediction, store the predicted values.
    pred_values = []
    pred_y_values = []

    // Prediction is needed when there are more X values than Y values.
    // Remove the extra X values and save them into pred_values.
    if (x_values.length > y_values.length) {
        pred_values = (x_values.splice(y_values.length))
    }

    // Calculating mean, standard deviation
    let x_mean = x_values.reduce((a, b) => a + b, 0) / x_values.length
    let y_mean = y_values.reduce((a, b) => a + b, 0) / y_values.length

    let x_sd = 0
    let y_sd = 0
    let xi_x = []
    let yi_y = []

    for (u of x_values) {
        x_sd += (u - x_mean) ** 2
        xi_x.push(u - x_mean)
    }

    for (v of y_values) {
        y_sd += (v - y_mean) ** 2
        yi_y.push(v - y_mean)
    }

    x_sd = Math.sqrt(x_sd / (x_values.length - 1))
    y_sd = Math.sqrt(y_sd / (y_values.length - 1))

    // Calculating the Pearson Correlation Coefficient
    let r_s = 0
    for (let i = 0; i < xi_x.length; i++) {
        r_s += xi_x[i] * yi_y[i]
    }

    let pearson = (1 / (x_values.length - 1)) * (r_s / (x_sd * y_sd))

    // Calculating b1 and b0 (slope and intercept of the regression line)
    let upper_sum = 0
    let bottom_sum = 0

    for (let i = 0; i < x_values.length; i++) {
        upper_sum += (x_values[i] - x_mean) * (y_values[i] - y_mean)
        bottom_sum += (x_values[i] - x_mean) ** 2
    }

    let b1 = upper_sum / bottom_sum
    let b0 = y_mean - b1 * x_mean

    // Predicting values using b1 and b0 and adding them to all lists for plotting
    // Also appending new values to the 'Y values' input box
    if (pred_values.length > 0) {
        for (v of pred_values) {
            x_values.push(v)
            y_values.push(Math.round(b0 + b1 * v))
            pred_y_values.push(Math.round(b0 + b1 * v))
            y_input.value = y_input.value + ', ' + Math.round(b0 + b1 * v)
        }
    }

    // Displaying the calculated statistics
    res.innerText =
        "X Mean = " + x_mean.toFixed(3) +
        "\nX SD = " + x_sd.toFixed(3) +
        "\nY Mean = " + y_mean.toFixed(3) +
        "\nY SD = " + y_sd.toFixed(3) +
        "\n\nb1 (Slope) = " + b1.toFixed(3) +
        "\nb0 (Intercept) = " + b0.toFixed(3) +
        "\n\nPCC = " + pearson.toFixed(3)

    // Displaying the predicted values (if prediction happened, else displaying a dash)
    pred.innerText = pred_y_values.length > 0 ? pred_y_values.join(", ") : '-'

    drawChart(x_values, y_values, b0, b1, pred_values, pred_y_values)
}

function drawChart(x_values, y_values, b0, b1, pred_x, pred_y) {
    // Emptying the datasets on the plot for new data
    chart.data.datasets = []
    chart.update()

    // Creating (x,y) objects for the plot.
    let scatter_data = x_values.map((x, i) => {
        return {
            x: x,
            y: y_values[i]
        };
    });

    let pred_scatter_data = pred_x.map((x, i) => {
        return {
            x: x,
            y: pred_y[i]
        };
    });

    // Setting up the tick values
    chart.options.scales.xAxes.ticks = x_values
    chart.options.scales.yAxes.ticks = y_values

    // Drawing the main scatter plot (inserted data).
    // If there are any predicted points, they are not drawn (spliced away from the end),
    // even though we still want them in the main x_values array to draw the regression line.
    chart.data.datasets.push({
        label: 'Data',
        data: scatter_data.splice(0, x_values.length - pred_x.length),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointRadius: 7,
        pointHoverRadius: 10
    })

    // Drawing predicted points (if there are any)
    if (pred_x.length > 0) {
        chart.data.datasets.push({
            label: 'Prediction',
            data: pred_scatter_data,
            backgroundColor: 'rgba(255, 206, 86, 0.5)',
            borderColor: 'rgba(255, 206, 86, 1)',
            pointRadius: 7,
            pointHoverRadius: 10
        })
    }

    // Two points for drawing the regression line.
    let reg_data = [
        { x: Infinity, y: 0 },
        { x: -Infinity, y: 0 }
    ]

    // TODO: maybe fix this mess
    // Finding the minimum x value and maximum x value, saving the corresponding points.
    for (x of x_values) {
        if (x < reg_data[0]['x']) {
            reg_data[0]['x'] = x;
            reg_data[0]['y'] = b0 + b1 * x;
        }
        if (x > reg_data[1]['x']) {
            reg_data[1]['x'] = x;
            reg_data[1]['y'] = b0 + b1 * x;
        }
    }

    // Drawing the regression line.
    chart.data.datasets.push({
        label: 'Regression',
        data: reg_data,
        type: 'line',
        cubicInterpolationMode: 'monotone',
        pointRadius: 0,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        showLine: true,
        fill: false
    })

    chart.update(0)
}