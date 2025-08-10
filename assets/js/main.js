// main.js - loads posts.json, renders index and post pages, initializes plugins

(function($){
  'use strict';

  // Utility
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function byId(id){ return document.getElementById(id); }

  // Set year
  document.addEventListener('DOMContentLoaded', function(){
    var yrs = document.querySelectorAll('#year');
    yrs.forEach(function(el){ el.textContent = new Date().getFullYear(); });
  });

  // DOM ready
  $(function(){

    // Mobile menu toggle
    $('#mobile-toggle').on('click', function(){
      var $mm = $('#mobile-menu');
      $mm.prop('hidden', !$mm.prop('hidden'));
    });

    // Dark toggle (very small: toggles a class)
    $('#dark-toggle').on('click', function(){
      document.documentElement.classList.toggle('dark-mode');
    });

    // Load posts.json
    function loadPosts(){
      return fetch('posts.json').then(function(r){
        if (!r.ok) throw new Error('Could not load posts.json');
        return r.json();
      });
    }

    // Render index posts
    var $posts = $('#posts');
    if ($posts.length){
      loadPosts().then(function(posts){
        $posts.empty();
        posts.forEach(function(p){
          var col = $('<div class="col-md-6"></div>');
          var card = $(
            '<article class="post-card '+ (p.category || '') +'">'+
              '<a href="post.html?id='+encodeURIComponent(p.id)+'" class="d-block">'+
                '<img class="post-img" src="'+escapeHtml(p.image||'assets/img/placeholder.png')+'" alt="'+escapeHtml(p.title)+'">'+
                '<div class="post-body">'+
                  '<h5>'+escapeHtml(p.title)+'</h5>'+
                  '<p class="post-meta">'+ escapeHtml(p.excerpt) +'</p>'+
                  '<p class="post-meta">'+ escapeHtml(p.date) + ' • ' + escapeHtml(p.author) +'</p>'+
                '</div>'+
              '</a>'+
            '</article>'
          );
          col.append(card);
          $posts.append(col);
        });

        // Initialize Isotope (after images loaded)
        var iso = null;
        imagesLoaded( document.querySelector('#posts'), function(){
          iso = new Isotope('#posts', { itemSelector: '.col-md-6', layoutMode: 'fitRows' });
        });

        // Filter buttons
        $('.filter-btn').on('click', function(){
          $('.filter-btn').removeClass('active');
          $(this).addClass('active');
          var filter = $(this).data('filter');
          if (iso) iso.arrange({ filter: filter === '*' ? '*' : function(itemElem){
            return $(itemElem).find('.post-card').hasClass(filter.slice(1));
          }});
        });

        // Featured carousel
        var featured = posts.filter(p => p.featured);
        if (featured.length){
          var $owl = $('#featured-carousel');
          featured.forEach(function(f){
            var slide = '<div class="item"><a href="post.html?id='+encodeURIComponent(f.id)+'"><img src="'+escapeHtml(f.image)+'" class="img-fluid rounded"><div class="mt-2"><h6>'+escapeHtml(f.title)+'</h6><p class="small text-muted">'+escapeHtml(f.excerpt)+'</p></div></a></div>';
            $owl.append(slide);
          });
          $owl.owlCarousel({ items:1, loop:true, margin:10, nav:true, autoplay:true, autoplayTimeout:5000 });
        }

      }).catch(function(err){
        console.error(err);
        $posts.html('<div class="col-12"><p class="text-danger">Unable to load posts.</p></div>');
      });
    }

    // Render single post page
    if (byId('post-title')){
      var params = new URLSearchParams(location.search);
      var id = params.get('id');
      if (!id){ document.getElementById('post-title').textContent = 'Post not found'; }
      else {
        loadPosts().then(function(posts){
          var post = posts.find(function(p){ return String(p.id) === String(id); });
          if (!post){
            document.getElementById('post-title').textContent = 'Post not found';
            return;
          }
          document.getElementById('post-title').textContent = post.title;
          document.getElementById('post-author').textContent = post.author;
          document.getElementById('post-date').textContent = post.date;
          document.getElementById('post-image').src = post.image || 'assets/img/placeholder.png';
          document.getElementById('post-image').alt = post.title;
          document.getElementById('post-content').innerHTML = post.content;

          // related
          var related = document.getElementById('related');
          related.innerHTML = posts.filter(p=>p.id!==post.id).slice(0,5).map(function(p){
            return '<li><a href="post.html?id='+p.id+'">'+escapeHtml(p.title)+'</a></li>';
          }).join('');
        });
      }
    }

    // Subscribe/contact dummy handlers
    $('#subscribe-form').on('submit', function(e){
      e.preventDefault();
      alert('Thanks — subscribe simulated (demo).');
      this.reset();
    });
    $('#contact-form').on('submit', function(e){
      e.preventDefault();
      alert('Message sent (demo).');
      this.reset();
    });

    // Small helper: imagesLoaded shim if missing
    // If imagesLoaded is not in CDN, we provide a minimal fallback:
    window.imagesLoaded = window.imagesLoaded || function(container, cb){
      var imgs = container.querySelectorAll('img');
      var total = imgs.length, count = 0;
      if (!total) return cb();
      imgs.forEach(function(i){
        if (i.complete) { if (++count === total) cb(); }
        else i.addEventListener('load', function(){ if (++count === total) cb(); });
        i.addEventListener('error', function(){ if (++count === total) cb(); });
      });
    };

  }); // end jquery ready

})(jQuery);
