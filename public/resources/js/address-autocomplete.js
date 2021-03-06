/*eslint no-unused-vars: off*/

function bindACInputToMap(targetMap,inputId,justLocate)
{

    var autocomplete = new google.maps.places.Autocomplete(document.getElementById(inputId),{
        types: ['geocode'],
        //setting preference to NSW bounds:
        //bounds: (new google.maps.LatLngBounds({lat: -35.816081, lng:141.035681 },{lat:-28.108865 , lng:153.560095 }))
    });
    //autocomplete.setComponentRestrictions({'country': ['au']});
    // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.

    autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            alert('No details available for input: \'' + place.name + '\'. Please select from one of the suggested addresses.');
            return;
        }

        var foundLatLng = place.geometry.location.toJSON();
        var addrDetailLevel=place.address_components.length;

        if (targetMap)
        {
            targetMap.setView([place.geometry.location.lat(), place.geometry.location.lng()],(addrDetailLevel > 3) ? 17 : 7);
            if (!justLocate)
            {
                if(targetMap.msf_marker)
                    targetMap.removeLayer(targetMap.msf_marker);
                targetMap.msf_latlng = foundLatLng;
                targetMap.msf_marker = L.marker(foundLatLng).addTo(targetMap);
            }
            $('#'+inputId+'Lat').val(place.geometry.location.lat().toFixed(7));
            $('#'+inputId+'Lng').val(place.geometry.location.lng().toFixed(7));
        }
        var area = {
            region: '',
            country: '',
            country_code: ''
        };
        for (var placeIdx = 0 ; placeIdx < place.address_components.length; placeIdx++) {
            var placeObj = place.address_components[placeIdx];
            if (placeObj.types.indexOf('administrative_area_level_1')> -1) {
                // currentEventProperties.metadata['region'] = ($('#eventRegion').val() !== '' ? $('#eventRegion').val() + ', ' : '') +placeObj.long_name;
                area.region = placeObj.long_name;
            }
            if(placeObj.types.indexOf('country')> -1){
                // var currentCountries = $('#eventCountries span.tags').text().replace(/ x /g, ', ');
                // currentEventProperties.metadata['country'] = (currentCountries !== '' ? currentCountries : '') + placeObj.long_name;
                area.country = placeObj.long_name;
                area.country_code = placeObj.short_name;
            }
        }

        if (inputId === 'editEventAddress') {
            if(_.findIndex(currentEventProperties.metadata.areas, area) != -1){
                alert('Area is already listed');
            }else{
                currentEventProperties.metadata.areas.push(area);
                updateLocation(reloadArea);
            }
        }else if( inputId === 'editEventRespAddress'){
            currentEventProperties.metadata.msf_response_location = {
                coordinates: foundLatLng,
                type: 'Point',
                area
            };
            updateLocation();
        }

    });

    function reloadArea(){
        vmObject.data.event.metadata.areas = currentEventProperties.metadata.areas; // updates model in inline editing
        vmObject.data.areas = vmObject.data.event.metadata.areas ;
        vmObject.data.event.metadata.areas = currentEventProperties.metadata.areas; // updates model in modal editing
    }

    function updateLocation(callback){
        $.ajax({
            type: 'PUT',
            url: '/api/events/' + currentEventId,
            data: JSON.stringify({
                status: currentEventProperties.status,
                type: currentEventProperties.type,
                metadata: currentEventProperties.metadata
            }),
            contentType: 'application/json'
        }).done(function( data, textStatus, req ){
            if(callback) callback();
        }).fail(function(err) {
            if (err.responseText.includes('expired')) {
                alert('session expired');
            } else {
                alert('error: '+ err.responseText);
            }
        });
    }

    $('#'+inputId+'Locate').on('click',function(){
        var eLat=Number($('#'+inputId+'Lat').val());
        var eLng=Number($('#'+inputId+'Lng').val());
        //validation:
        if ((!eLat)||(!eLng)||(eLat<-90)||(eLat>90)||(eLng<-180)||(eLng>180))
        {
            alert('Invalid coordinates entered.');
            return;
        }
        $('#'+inputId).val('');
        var enteredLatLng={lat: eLat, lng: eLng };
        targetMap.setView([enteredLatLng.lat, enteredLatLng.lng], 6);
        if (!justLocate)
        {
            if(targetMap.msf_marker)
                targetMap.removeLayer(targetMap.msf_marker);
            targetMap.msf_latlng = enteredLatLng;
            targetMap.msf_marker = L.marker(enteredLatLng).addTo(targetMap);
        }
    });
}

function initGoogle()
{

    bindACInputToMap(autocompleteMap,'mapAddress');

}
