$.widget("custom.extendedAutocomplete", $.ui.autocomplete, {
    _create: function () {
        this._super();

        // The auto-complete uses the menu widget
        // Tell the widget framework what 'items' in the menu are.
        this.widget().menu("option", "items", "li > a, .searchResultDropdown border > ul");
        // Tell the widget what menu's are.
        // Due to the structure of the auto-complete results, the actual results are interpreted as a sub-menu.
        // We override this by modifying the selector for menu items.
        this.widget().menu("option", "menus", ".menu");
    },
    
    _renderMenu: function (ul, items) {     
        
        // Method that is used to render the auto-complete menu.
        // jQuery UI passes you an 'ul' which you can fill.
        // The items argument is the web service response 'as is'.
        var that = this;
        
        $.each(items.resultCollections, function (index, category) {
            // the resultCollections is a collection of categories/sections of the auto-complete.
            // A section/category could be products, or combinations.
  
            // Render the contents of the div with class acList.
            if ((category.suggestions && category.suggestions.length > 0) || (category.products && category.products.length > 0)) {
                // There are search results, render them.
                that._renderSuggestItems(ul, category);
                
                that._renderProductItems(ul, category);
            }
            else {
                // There are no search results, render a message.
                that._renderCategoryNoResults(ul, category);
            }
        });

        $(this.options.appendTo).show();
    },

    _renderCategoryNoResults: function (parentContainer, category) {
       
        // Method responsible for rendering a message that there are no results available.
        // Expected outcome:     
        //  <li>
        //      <span>Geen resultaten</span>
        //  </li>
        
       var li = $("<li />")            
            .appendTo(parentContainer);

            
        var suggestHeader = $("<div />").addClass("autoSuggestHeader cf");     

        //Add header
        $("<h3 />")
           .addClass("altHead head3")
           .text(category.noResultsText)
           .appendTo(suggestHeader);     
            
       suggestHeader.appendTo(li);
            
    },
    
    _renderSuggestItems: function (parentContainer, category) {
               
        if (category.suggestions && category.suggestions.length > 0)
        {
            var categoryContainer = $("<li />")
            .appendTo(parentContainer);
            
            /*
            <li>
                <div class="autoSuggestHeader cf">
                     <h3 class="altHead head3">Bedoel je soms:</h3>
                     <a href="#" class="more with-icon"><i class="icon-cancel"></i><span>Zoekresultaten sluiten</span></a>
                </div>
                <ul class="searchResultSuggestions">
                    _renderSuggestItem
                </ul>
            </li>
            */
            
            var suggestHeader = $("<div />").addClass("autoSuggestHeader cf");                     
            //var suggestG = $("<div />").addClass("gi b0_12 b3_24").appendTo($("<div />").addClass("g").appendTo(suggestHeader)); 
            //Add header
            $("<h3 />")
               .addClass("altHead head3")
               .text("Zoekresultaten")
               .appendTo(suggestHeader);
            
            var textSpan = $("<span />").text("Zoekresultaten sluiten");
            var icon = $("<i />").addClass("icon-cancel");
            var thisBinding = this;
            var a = $("<a />").attr("href", '#').addClass("more with-icon").click(function() {
                thisBinding._close(); 
            });
            
            icon.appendTo(a);
            textSpan.appendTo(a);
           
            a.appendTo(suggestHeader); 
            
            suggestHeader.appendTo(categoryContainer);
            
            var ul = $("<ul />")
                        .addClass("searchResultSuggestions")
                        .appendTo(categoryContainer);
                        
            for (var iterator = 0; iterator < category.suggestions.length; iterator++) {
                this._renderSuggestItem(ul, category.suggestions[iterator]);
            }
        }        
    },   
    
    _renderSuggestItem: function (parentContainer, item) {

        /* 
        <li class="searchResultItem">
            <a href="#">                            
                <div>
                    <span>Autodrop</span>,
                </div>
            </a>
        </li>  
         
        */        
        var li = $("<li />").addClass("searchResultItem").appendTo(parentContainer);
               
        var link = $("<a />")
            .attr("data-query", item.label)
            .attr("href", "#").appendTo(li);
        
        var divTitle = $("<div />").appendTo(link);
        
        $("<span />").text(item.value).appendTo(divTitle);
    
    },
    
    _renderProductItems: function (parentContainer, category) {
     
        if (category.products && category.products.length > 0)
        {
            var categoryContainer = $("<li />")
            .appendTo(parentContainer);
            /*
            <li>
                <div class="autoSuggestHeader cf">
                    <h3 class="altHead head3">Producten</h3>
                    <a class="more" href="?"><span>Meer producten (8)</span></a>
                </div>
                <ul class="searchResultList">
                    
                </ul>
            </li>
            */
            
            var suggestHeader = $("<div />").addClass("autoSuggestHeader cf");     

            //Add header
            $("<h3 />")
               .addClass("altHead head3")
               .text("Producten")
               .appendTo(suggestHeader);
            
            var totalnumberofproducts = category.totalproducts || 0;
            
            $("<span />").text("Meer producten (" + totalnumberofproducts + ")").appendTo($("<a />") .attr("href", '#').attr("data-more", "").addClass("more").appendTo(suggestHeader));              
                  
            suggestHeader.appendTo(categoryContainer);
            
            var ul = $("<ul />")
                        .addClass("searchResultList")
                        .appendTo(categoryContainer);
                        
            for (var iterator = 0; iterator < category.products.length; iterator++) {
                this._renderProductItem(ul, category.products[iterator]);
            }
        }
    },
    
    _renderProductItem: function (parentContainer, item) {

        /*
        <li class="searchResultItem">
            <a href="#">
                <div class="img">
                    <img alt="" src="/_cmsdata/Categorie-banners-200x200px-2.jpg" data-src-at2x="/_cmsdata/Categorie-banners-200x200px-2.jpg">
                </div>
                <div>
                    <div class="productTitle">Old Amsterdam</div>
                    <div class="productSubTitle">Per stuk 400 gram</div>
                </div>
            </a>
        </li>
         */       
        var li = $("<li />").addClass("searchResultItem").appendTo(parentContainer);
               
        var link = $("<a />")           
            .attr("href", item.url).appendTo(li);
        
        var divImage = $("<div />").addClass("img").appendTo(link);
        $("<img />").attr('src', item.image).appendTo(divImage);
        
        var divTitle = $("<div />").appendTo(link);        
        $("<div />").addClass("productTitle").text(item.name).appendTo(divTitle);
        $("<div />").addClass("productSubTitle").text(item.subtitle).appendTo(divTitle);
                
    },
 
    _normalize: function (items) {
                
        // Do not edit this method, unless you know what you are doing!
        // Override the normalize operation.
        // It tries to 'flatten' the data to label/value pairs, but we need more detail.
        
        if (!items || !items.resultCollections) {
            return null;
        }

        // Set the length manually, or the suggest will not trigger.
        items.length = items.resultCollections.length;
        return items;
    },
    _close: function (event) {
        // Do not edit this method, unless you know what you are doing!
        if (this.options.toggleElement.hasClass("open")) {
            // Commented out hiding the menu
            this.menu.element.parent().hide();

            // Custom code: hide the toggle container
            this.options.toggleElement.removeClass("open");
            this.options.toggleElement.blur();
            // End custom code.

            this.menu.blur();
            this.isNewMenu = true;
            this._trigger("close", event);
        }
    },
    _suggest: function( items ) {
        
        var container = this.menu.element.empty();
                
        this._renderMenu( container, items );
        this.isNewMenu = true;
        this.menu.refresh();

        // size and position menu
        container.show();

        // Custom code: add 'open' class to the toggle container.
        this.options.toggleElement.addClass("open");
        // End custom code

        this._resizeMenu();
        container.position( $.extend({
            of: this.element
        }, this.options.position ));

        if ( this.options.autoFocus ) {
            this.menu.next();
        }
    }
});


