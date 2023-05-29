const config = getConfig();
const includeTests = getIncludeTests();

const viewModel = {
    show: !config.isMissing,
    title: config.project,
    latestFullDate: "",
    includeTests: includeTests,
    authors: [],
    repos: [],
    totalForAuthors: 0,
    totalForRepos: 0,
};

(async () => {
    const authorData = {};
    const repoData = {};
    let latestFullDate = "";

    try {
        if (viewModel.show) {
            const headers = new Headers();
            headers.set("Authorization", "Basic " + btoa(":" + config.pat));

            const resp = await fetch(`https://dev.azure.com/${config.organization}/${config.project}/_apis/git/pullrequests?api-version=7.0&searchCriteria.status=completed`, {
                headers: headers
            });
            const json = await resp.json();

            for (let i = 0; i < json.value.length; i++) {
                const pr = json.value[i];

                const repo = pr.repository.name;
                const author = pr.createdBy.displayName;
                latestFullDate = pr.completionQueueTime;

                if (!viewModel.includeTests && repo == "Tests") {
                    continue;
                }

                add(repoData, repo);
                add(authorData, author);
            }

            const sortedAuthorData = sort(authorData);
            const sortedRepoData = sort(repoData);

            viewModel.authors = sortedAuthorData;
            viewModel.repos = sortedRepoData;

            viewModel.totalForAuthors = sortedAuthorData.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0);
            viewModel.totalForRepos = sortedRepoData.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0);

            viewModel.latestFullDate = latestFullDate;
        }

        const { createApp } = Vue;

        createApp({
            data() {
                return viewModel;
            },
            watch: {
                includeTests(newVal, oldValue) {
                    const end = window.location.href.indexOf('?');
                    let withoutQs = '';
                    if (end == -1) {
                        withoutQs = window.location.href;
                    } else {
                        withoutQs = window.location.href.substring(0, end);
                    }
                    window.location = `${withoutQs}?includeTests=${newVal}`;
                }
            },
            computed: {
                shortDate() {
                    return this.latestFullDate.substring(0, 10);
                },
                niceTitle() {
                    if (this.title) {
                        return this.title.replace("%20", " ");
                    }
                }
            }
        }).mount("#app");
    } catch (e) {
        console.log(e);
    }
})();

function add(dict, key) {
    if (dict[key] == undefined) {
        dict[key] = 1;
    } else {
        dict[key] = dict[key] + 1;
    }

}

function sort(dict) {
    const items = Object.keys(dict).map((key) => { return [key, dict[key]] });

    // Step - 2
    // Sort the array based on the second element (i.e. the value)
    items.sort(
        (first, second) => { return second[1] - first[1] }
    );

    const sorted = [];

    // Step - 3
    for (let i = 0; i < items.length; i++) {
        var item = items[i];

        sorted[i] = { "name": item[0], "value": item[1] };
    }

    return sorted;
}

function getIncludeTests() {
    const urlParams = new URLSearchParams(window.location.search);
    const includeTests = urlParams.get("includeTests");

    if (includeTests == undefined) {
        return true;
    }

    if (includeTests == "true") {
        return true;
    }

    return false;
}

function getConfig() {
    const pat = window.localStorage.getItem("pat");
    const organization = window.localStorage.getItem("organization");
    const project = window.localStorage.getItem("project");

    const isMissing = pat == undefined || organization == undefined || project == undefined
        ? true
        : false;

    return {
        pat, organization, project, isMissing
    };
}