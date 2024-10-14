const API_BASE = 'https://api.snusbase.com';
const sb_hash = 'sbtcr6yb8x7zwloslhrsvnhdtfw3o1';
const e = (html) => {
    try {
        return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    } catch {
        return html;
    }
}
;
const sendRequest = async (url, body=false) => {
    const options = {
        method: (body) ? 'POST' : 'GET',
        headers: {
            'Auth': sb_hash,
            'Content-Type': 'application/json',
        },
        body: (body) ? JSON.stringify(body) : null
    }
    const response = await fetch(API_BASE + url, options);
    return await response.json();
}
const combo_v2_expand = (el) => {
    el.onclick = '';
    el.style.cursor = 'auto';
    el.querySelector('.expand').remove();
    el.querySelector('.combolist_res').style.display = 'block';
}
;
const combo_v2 = async (term) => {
    try {
        const response = await fetch(`https://api.snusbase.com/temp/combolists/${encodeURIComponent(term)}`, {
            headers: {
                authorization: sb_hash
            }
        });
        return await response.json();
    } catch (err) {
        console.error(err);
        return {};
    }
}
;
const combo_v2_parse = async function(term, original) {
    const res = await combo_v2(term);
    if (!res.error && res.size >= 1) {
        document.getElementById('result_count').textContent = res.size + original;
        const comboel = document.getElementById('combolists');
        comboel.innerHTML = '';
        Object.keys(res.result).forEach(el => {
            const s_or_nah = res.result[el].length < 2 ? 'result' : 'results';
            const comboHTML = `
                <div class="searchtools combo" id="${el}" onclick="combo_v2_expand(this)">
                    <div class="topbar">${el.toUpperCase()} - ${res.result[el].length} ${s_or_nah}</div>
                    <div class="combolist_res" style="display: none;" id="combolist_res_${el}"></div>
                    <div id="expand_${el}" class="expand">(click to expand)</div>
                </div>`;
            comboel.insertAdjacentHTML('beforeend', comboHTML);
            res.result[el].forEach(element => {
                document.getElementById(`combolist_res_${el}`).insertAdjacentHTML('beforeend', `<div>${e(element.username)}<span class="combo_sep"> </span>${e(element.password)}</div>`);
            }
            );
        }
        );
    } else {
        console.error(res);
    }
};
const fetch_pass = async (string) => {
    const terms = new Set();
    string.split(/[: ]/).forEach(term => {
        terms.add(term);
    }
    );
    terms.add(string);
    const response = await sendRequest('/tools/hash-lookup', {
        terms: Array.from(terms),
        types: ['hash'],
        group_by: false
    })
    let password = false
    response.results.forEach(result => {
        console.log(result)
        if (result.password) {
            password = result.password;
        }
    }
    );
    return password;
}
const load_pass = (el) => {
    const hash = el.innerHTML;
    try {
        el.innerHTML = 'Cracking...';
        el.onclick = '';
        fetch_pass(hash).then( (password) => {
            console.log('found', password)
            if (password) {
                el.innerHTML = hash + '<br/><span class="x-cleartext">' + password + '</span>';
                el.classList = 'datatable';
            } else {
                el.innerHTML = hash;
                el.style.color = 'rgb(199, 63, 63)';
                el.classList = 'datatable';
            }
        }
        )
    } catch (err) {
        el.innerHTML = hash
        console.error(err);
    }
}
const fetch_ipwhois = async (terms) => {
    const url = `https://api.snusbase.com/tools/ip-whois`;
    const body = JSON.stringify({
        terms: terms
    });
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Auth': sb_hash,
            'Content-Type': 'application/json'
        },
        body: body
    }).then(response => response.json()).catch(err => console.error(err));
    return res;
}
const load_ipwhois = async (el) => {
    var term = el.innerHTML.trim();
    el.innerHTML = 'Fetching...';
    fetch_ipwhois([term]).then( (res) => {
        if (res && res.results && res.results[term] && res.results[term].status === "success") {
            const result = res.results[term];
            el.innerHTML = `${term} <br/><span class="x-ip-location">${result.city}, ${result.regionName}, ${result.country}</span>`;
            el.onclick = '';
            el.classList = 'datatable';
        } else {
            el.innerHTML = term;
            el.classList.add('datatable');
            el.onclick = null;
            el.style.color = 'rgb(199, 63, 63)';
        }
    }
    );
}
const loadViewMore = async (did, element) => {
    const vmButtons = document.querySelectorAll(`#vmb${did}`);
    vmButtons.forEach(vmButton => {
        vmButton.innerHTML = 'Loading...';
    }
    );
    const dataElements = document.querySelectorAll(`#data${did}`);
    try {
        const tableName = `${did}_${Array.from(element.parentNode.childNodes).filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent.trim()).join('')}`;
        const query = {
            terms: [document.getElementById('searchbar').value],
            types: [document.querySelector('input[name="searchtype"]:checked').value],
            tables: [tableName],
            options: [document.getElementById('wildcard').checked ? 'wildcard' : ''],
            group_by: 'db',
        };
        const response = (await sendRequest('/data/search', query)).results[tableName];
        for (let i = 0; i < response.length; i++) {
            const strings = [];
            const keys = Object.keys(response[i]);
            keys.forEach(key => {
                if (!['_domain', 'db'].includes(key))
                    strings.push(`<tr><td>${key}</td><td class="datatable x${key}">${response[i][key]}</td></tr>`);
            }
            );
            dataElements[i].innerHTML = strings.join('');
            dataElements[i].querySelectorAll('.xlastip, .xhash').forEach(el => {
                if (el.classList.contains('xlastip')) {
                    load_ipwhois(el);
                } else {
                    load_pass(el);
                }
            }
            )
        }
        vmButtons.forEach(vmButton => {
            vmButton.innerHTML = '';
            vmButton.onclick = '';
        }
        );
    } catch (err) {
        console.error(err);
        vmButtons.forEach(vmButton => vmButton.innerHTML = 'View More');
    }
}
window.onload = () => {
    document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            this.parentElement.classList.toggle('sb_checkbox_checked', this.checked);
        });
    }
    );
}
;
