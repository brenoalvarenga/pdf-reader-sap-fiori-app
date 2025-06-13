sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'pdfreader/pdfreader/test/integration/FirstJourney',
		'pdfreader/pdfreader/test/integration/pages/pdfFilesMain'
    ],
    function(JourneyRunner, opaJourney, pdfFilesMain) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('pdfreader/pdfreader') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThepdfFilesMain: pdfFilesMain
                }
            },
            opaJourney.run
        );
    }
);