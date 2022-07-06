'use strict';

const token =  //Paste API token here ;

const getContributions = async function (username, token) {
  try {
    const headers = {
      Authorization: `bearer ${token}`,
    };

    const body = {
      query: `query {
          user(login: "${username}") {
            name
            contributionsCollection {
              contributionCalendar {
                colors
                totalContributions
                weeks {
                  contributionDays {
                    color
                    contributionCount
                    contributionLevel
                    date
                    weekday
                  }
                  firstDay
                }
              }
            }
          }
        }`,
    };

    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers,
    });
    const { data } = await res.json();

    return data;
  } catch (err) {
    console.error(err);
  }
};

const contributionGraph = async function (e) {
  const data = await getContributions('sleepyblue', token);

  console.log(data);

  const totalContributions =
    data.user.contributionsCollection.contributionCalendar.totalContributions;

  const contributionsHeader = document.querySelector(
    '.heatmap__contributions-header'
  );

  contributionsHeader.textContent = `${totalContributions} contributions `;

  const dataLength =
    data.user.contributionsCollection.contributionCalendar.weeks.length;

  const currentWeek =
    data.user.contributionsCollection.contributionCalendar.weeks[
      dataLength - 1
    ];

  const weekLength = currentWeek.contributionDays.length;

  const currentDay = currentWeek.contributionDays[weekLength - 1];

  const currentDate = new Date(currentDay.date);

  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });

  const monthHeader = document.querySelector('.heatmap__month-header');
  monthHeader.textContent = currentMonth;

  let weekArr = [];

  data.user.contributionsCollection.contributionCalendar.weeks
    .slice(-5)
    .map((week) => week.contributionDays)
    .forEach((cday) => weekArr.push(...cday));

  const heatmapContainer = document.querySelector('.heatmap__container');
  heatmapContainer.innerHTML = '';

  weekArr.forEach((day) => {
    const contributionMonth = new Date(day.date).getMonth();
    const currentMonth = new Date().getMonth();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };

    const markdown = `
    <div class="heatmap__box heatmap__${
      contributionMonth === currentMonth ? 'current' : 'past'
    }" data-contributions="${day.contributionCount}" data-date="${day.date}">
      <div class="heatmap__modal">
        <p>${day.contributionCount} contributions on ${new Intl.DateTimeFormat(
      'en-GB',
      options
    ).format(new Date(day.date))}</p>
      </div>
    </div>
    `;

    heatmapContainer.insertAdjacentHTML('beforeend', markdown);
  });
};

const graphColouring = async function () {
  await contributionGraph();

  const heatBox = document.querySelectorAll('.heatmap__box');

  heatBox.forEach((box) => {
    if (+box.dataset.contributions === 1) box.classList.add('heat__1');
    if (+box.dataset.contributions === 2) box.classList.add('heat__2');
    if (+box.dataset.contributions === 3) box.classList.add('heat__3');
    if (+box.dataset.contributions === 4) box.classList.add('heat__4');
  });
};

graphColouring();
