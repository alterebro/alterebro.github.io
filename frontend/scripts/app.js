var githubUser = 'alterebro';
var githubAPI = {
	repos : 'https://api.github.com/users/' + githubUser + '/repos?sort=pushed',
	user : 'https://api.github.com/users/' + githubUser
}

var data = {
	user : githubUser,
    user_data : {},
	repos : null,
	user_languages : {},
	stars : 0,
	forks : 0,
	watching : 0
};

var app = new Vue({

	el : '#app',
	data: data,

	created: function () {
        this.getUserData();
		this.getReposData();
	},

	filters : {
		filterdate : function(str) {
			var _d = new Date(str);
			var  d = {
				d : ("0" + _d.getUTCDate()).slice (-2),
				m : ("0" + _d.getUTCMonth()).slice (-2),
				y : _d.getUTCFullYear(),
				hh : ("0" + _d.getUTCHours()).slice (-2),
				mm : ("0" + _d.getUTCMinutes()).slice (-2)
			};
			return (d.d + '.' + d.m + '.' + d.y + ' @' + d.hh + ':' + d.mm);
		},
        autolinks : function(str) {
            var output = str.replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1" target="_blank">$1</a> ');
            return output;
        }
	},

	methods : {

        // ---------------------
        // Get languages from each repository Endpoint
        setLanguages : function(langData, index) {

            data.repos[index].main_language = data.repos[index].language;

            var res = langData;
            var repo_langs = [];
            for ( var i in res ) {
                repo_langs.push(i);
                if ( i in data.user_languages ) {
                    Vue.set(data.user_languages, i, (data.user_languages[i] + res[i]));
                } else {
                    Vue.set(data.user_languages, i, res[i]);
                }
            }
            data.repos[index].language = repo_langs.join(', ');
        },
		getLanguages : function(index, url) {

            var self = this;
            var cache_key = (githubUser+'_repo_'+index).toLowerCase();
            var cache = Cache.get(cache_key);
            if ( !!cache ) {

                self.setLanguages(cache, index);

            } else {

                var langData = {};
                atomic.get(url).success(function (d, x) {
                    langData = d;
                    Cache.set(cache_key, langData);
                })
    			.error(function () {})
    			.always(function () {
                    self.setLanguages(langData, index);
                });
            }
		},

        // ---------------------
        // Repos Data
        setReposData : function(reposData) {
            data.repos = reposData;
            for (var i=0; i<reposData.length; i++) {
                data.stars += reposData[i].stargazers_count;
                data.forks += reposData[i].forks_count;
                data.watching += reposData[i].watchers_count;

                this.getLanguages(i, reposData[i].languages_url);
            }
        },
		getReposData : function() {

			var self = this;
            var cache_key = githubUser+'_repos'.toLowerCase();
            var cache = Cache.get(cache_key);
            if ( !!cache ) {

                self.setReposData(cache);

            } else {

                var reposData = [];
                atomic.get(githubAPI.repos).success(function (d, x) {
    				reposData = d;
                    Cache.set(cache_key, reposData);
    			})
    			.error(function () {})
    			.always(function () {
                    self.setReposData(reposData);
                });
            }
		},

        // ---------------------
        // User Data
        setUserData : function(userData) {
            data.user_data = userData;
        },
        getUserData : function() {

            var self = this;
            var cache_key = githubUser+'_user'.toLowerCase();
            var cache = Cache.get(cache_key);
            if ( !!cache ) {

                self.setUserData(cache);

            } else {

                var userData = {};
                atomic.get(githubAPI.user).success(function(d, x) {
                    userData = d;
                    Cache.set(cache_key, userData);
                })
                .error(function () {})
    			.always(function () {
                    self.setUserData(userData);
                });
            }
        }

	}
});
